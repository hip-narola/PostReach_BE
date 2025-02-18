import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { SocialMediaAccountService } from '../social-media-account/social-media-account.service';
import { SocialTokenDataDTO } from 'src/dtos/params/social-token-data-dto';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { PostRepository } from 'src/repositories/post-repository';
import { Post } from 'src/entities/post.entity';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { ConfigService } from '@nestjs/config';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';
import { AwsSecretsService } from '../aws-secrets/aws-secrets.service';
import { TOKEN_TYPE } from 'src/shared/constants/token-type-constants';
import { FacebookPageDetailsDTO } from 'src/entities/facebook-page-details.entity';
import { Logger } from '../logger/logger.service';

@Injectable()
export class FacebookService {
    private readonly apiUrl: string = 'https://graph.facebook.com/v21.0';
    private addId: string;
    private appSecret: string;

    constructor(private readonly socialMediaAccountService: SocialMediaAccountService, private readonly unitOfWork: UnitOfWork, private readonly configService: ConfigService, private readonly secretService: AwsSecretsService, private readonly logger: Logger) {
        this.initialize();
    }

    private async initialize() {
        const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
        this.addId = secretData.APP_ID_BUSINESS;
        this.appSecret = secretData.APP_SECRET_BUSINESS;
    }


    // async getUserPages(accessToken: string) {
    //     const response = await axios.get(`https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`);
    //     return response.data.data;
    // }

    async getInstagramAccount(facebookPageId: string, accessToken: string) {
        const response = await axios.get(`https://graph.facebook.com/${facebookPageId}?fields=instagram_business_account&access_token=${accessToken}`);
        return response.data;
    }

    async savePageAccessToken(pageId: string, pageAccessToken: string, platform: string, facebookId: string, userId: number, firstName: string, profilePicUrl: string, filePath: string) {
        const tokenDataDTO = new SocialTokenDataDTO({
            user_name: firstName,
            user_profile: profilePicUrl,
            page_id: pageId,
            facebook_Profile: facebookId,
            token_type: TOKEN_TYPE.PAGE_ACCESS_TOKEN,
            access_token: pageAccessToken,
            expires_in: null,
            scope: null,
            file_name: filePath
        });
        await this.socialMediaAccountService.storeTokenDetails(userId, tokenDataDTO, platform);

        return true;
    }

    async exchangeToLongLivedUserToken(shortLivedToken: string): Promise<string> {
        try {
            const appId = this.addId;
            const appSecret = this.appSecret;

            const url = `https://graph.facebook.com/v21.0/oauth/access_token?` +
                `grant_type=fb_exchange_token&` +
                `client_id=${appId}&` +
                `client_secret=${appSecret}&` +
                `fb_exchange_token=${shortLivedToken}`;

            const response = await axios.get(url);
            return response.data.access_token;
        }
        catch (error) {
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'exchangeToLongLivedUserToken'
            );
        }
    }

    async postToFacebook(
        PostId: number,
        pageId: string,
        accessToken: string,
        message?: string,
        hashtags?: string[],
        imageUrl?: string
    ) {
        const graphApiUrl = 'https://graph.facebook.com/v21.0';

        try {
            let finalMessage = message || '';

            // Append hashtags if provided
            if (hashtags && hashtags.length > 0) {
                finalMessage += `\n${hashtags.map((tag) => `${tag}`).join(' ')}`;
            }

            let response;

            // Case 1: Only Content with Hashtags
            if (finalMessage && !imageUrl) {
                const url = `${graphApiUrl}/${pageId}/feed`;
                response = await axios.post(
                    url,
                    { message: finalMessage },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
            }
            // Case 2: Only an Image
            else if (imageUrl && !finalMessage) {
                const url = `${graphApiUrl}/${pageId}/photos`;
                response = await axios.post(
                    url,
                    { url: imageUrl },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
            }
            // Case 3: Content with Hashtags and an Image
            else if (imageUrl && finalMessage) {
                const url = `${graphApiUrl}/${pageId}/photos`;
                response = await axios.post(
                    url,
                    {
                        url: imageUrl,
                        message: finalMessage,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
            } else {

            }
            // Update the database with the post ID
            await this.unitOfWork.startTransaction();
            const socialMediaInsightsRepo = this.unitOfWork.getRepository(PostRepository, Post, true);
            const record = await socialMediaInsightsRepo.findOne(PostId);
            record.external_platform_id = response.data.post_id || response.data.id;
            await socialMediaInsightsRepo.update(PostId, record);
            await this.unitOfWork.completeTransaction();

            return response.data;
        } catch (error: any) {
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'PostToFacebook'
            );
            await this.unitOfWork.rollbackTransaction();

        }
    }

    async fetchImageFromUrl(imageUrl: string): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
        try {
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
            });
            const mimeType = response.headers['content-type'];
            const fileName = imageUrl.split('/').pop() || 'downloaded_image';
            return {
                buffer: Buffer.from(response.data),
                mimeType,
                fileName,
            };
        } catch (error) {
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'fetchImageFromUrl'
            );
            throw error;
            throw new Error('Failed to fetch image from URL');
        }
    }


    async fetchAndUpdatePostData(posts: Post[]) {
        await this.unitOfWork.startTransaction();
        const postRepository = this.unitOfWork.getRepository(PostRepository, Post, true);
        try {
            for (const post of posts) {
                const socialMediaAccount = post.postTask?.socialMediaAccount;
                if (!socialMediaAccount?.encrypted_access_token || !post.external_platform_id) {
                    continue;
                }
                try {
                    // Fetch data from the Facebook API
                    const postDetails = await this.getPostDetails(
                        post.external_platform_id,
                        socialMediaAccount.encrypted_access_token,
                    );
                    const record = await postRepository.findOne(post.id);
                    record.no_of_comments = postDetails.comments;
                    record.no_of_likes = postDetails.likes;
                    record.no_of_views = postDetails.views;
                    await postRepository.update(post.id, record);
                } catch (error) {
                    await this.unitOfWork.rollbackTransaction();
                }
            }

            await this.unitOfWork.completeTransaction();
        }
        catch (error) {
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'fetchAndUpdatePostData'
            );
            await this.unitOfWork.rollbackTransaction();
        }
    }


    async getPostDetails(postId: string, accessToken: string): Promise<any> {
        try {
            const url = `${this.apiUrl}/${postId}?fields=likes.summary(true),comments.summary(true),insights.metric(post_impressions)&access_token=${accessToken}`;
            const response = await axios.get(url);
            const { likes, comments, insights } = response.data;
            return {
                likes: likes?.summary?.total_count || 0,
                comments: comments?.summary?.total_count || 0,
                views: insights?.data?.find(metric => metric.name === 'post_impressions')?.values[0]?.value || 0,
            };
        } catch (error) {
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'getPostDetails'
            );
            throw error;
        }
    }


    async connectedFacebookAccount(facebookPageDetails: FacebookPageDetailsDTO) {
        try {
            await this.unitOfWork.startTransaction();
            const socialMediaAccountRepository = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, true);
            const userSocialAccount = await this.socialMediaAccountService.findSocialAccountForConnectAndDisconnectProfile(facebookPageDetails.userId, SocialMediaPlatformNames[SocialMediaPlatform.FACEBOOK], false);

            if (!userSocialAccount) {

                const facebookDetails = new SocialMediaAccount();
                facebookDetails.encrypted_access_token = facebookPageDetails.access_token;
                facebookDetails.facebook_Profile = facebookPageDetails.faceBookId;
                facebookDetails.page_id = facebookPageDetails.id;
                facebookDetails.platform = SocialMediaPlatformNames[SocialMediaPlatform.FACEBOOK];
                facebookDetails.user_id = facebookPageDetails.userId;
                facebookDetails.user_name = facebookPageDetails.pageName;
                facebookDetails.user_profile = facebookPageDetails.logoUrl;
                facebookDetails.file_name = facebookPageDetails.filePath;
                facebookDetails.token_type = TOKEN_TYPE.PAGE_ACCESS_TOKEN;
                facebookDetails.facebook_Profile_access_token = facebookPageDetails.facebook_Profile_access_token;
                await socialMediaAccountRepository.create(facebookDetails);
            }
            else {
                userSocialAccount.encrypted_access_token = facebookPageDetails.access_token;
                userSocialAccount.facebook_Profile = facebookPageDetails.faceBookId;
                userSocialAccount.page_id = facebookPageDetails.id;
                userSocialAccount.platform = SocialMediaPlatformNames[SocialMediaPlatform.FACEBOOK];
                userSocialAccount.user_id = facebookPageDetails.userId;
                userSocialAccount.user_name = facebookPageDetails.pageName;
                userSocialAccount.user_profile = facebookPageDetails.logoUrl;
                userSocialAccount.file_name = facebookPageDetails.filePath;
                userSocialAccount.token_type = TOKEN_TYPE.PAGE_ACCESS_TOKEN;
                userSocialAccount.facebook_Profile_access_token = facebookPageDetails.facebook_Profile_access_token;

                await socialMediaAccountRepository.update(userSocialAccount.id, userSocialAccount);
            }
            await this.unitOfWork.completeTransaction();
        } catch (error: any) {
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'connectedFacebookAccount'
            );
            await this.unitOfWork.rollbackTransaction();
            throw new Error(`Failed to save connected page: ${error.message}`);
        }
    }


    async getPagePicture(pageId: string, accessToken: string): Promise<any> {
        const url = `https://graph.facebook.com/v21.0/${pageId}/picture?redirect=false&access_token=${accessToken}`;
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'getPagePicture'
            );
            throw error;
        }
    }



    async disconnectFacebookProfile(userId: number): Promise<string> {
        try {
            // 1. Retrieve the user's Facebook token from the database
            const userSocialAccount = await this.socialMediaAccountService.findSocialAccountForConnectAndDisconnectProfile(userId, SocialMediaPlatformNames[SocialMediaPlatform.FACEBOOK], false);
            if (!userSocialAccount) {
                throw new HttpException('No Facebook profile linked to this user.', HttpStatus.NOT_FOUND);
            }

            // 2. Revoke the token using Facebook Graph API
            await this.revokeFacebookAccess(userSocialAccount.facebook_Profile, userSocialAccount.facebook_Profile_access_token);
            await this.unitOfWork.startTransaction();
            const socialMediaAccountRepo = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, true);
            userSocialAccount.isDisconnect = true;
            await socialMediaAccountRepo.update(userSocialAccount.id, userSocialAccount);
            await this.unitOfWork.completeTransaction();
            return 'Facebook profile disconnected successfully.';
        }
        catch (error) {
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'disconnectFacebookProfile'
            );
            await this.unitOfWork.rollbackTransaction();
            throw error;
        }
    }


    private async revokeFacebookAccess(facebookUserId: string, accessToken: string) {
        try {
            await axios.delete(
                `https://graph.facebook.com/v21.0/${facebookUserId}/permissions`,
                { params: { access_token: accessToken } }
            );
        } catch (error) {
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'revokeFacebookAccess'
            );
            throw error;
        }
    }


    async getUserPages(accessToken: string): Promise<any> {
        try {
            const url = `https://graph.facebook.com/v21.0/me/accounts`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response;
        } catch (error) {
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'getUserPages'
            );
            throw new HttpException(
                error.response?.data || 'Failed to fetch pages',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }



}
