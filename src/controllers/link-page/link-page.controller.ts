import {
    Controller,
    Get,
    Query,
    Res,
    Post,
    Body,
    UseGuards,
    Req,
    HttpException,
    HttpStatus,
    Param,
} from '@nestjs/common';
import { TwitterService } from 'src/services/twitter/twitter.service';
import { LinkedinService } from 'src/services/linkedin/linkedin.service';
import { AuthGuard } from '@nestjs/passport';
import { InstagramService } from 'src/services/instagram/instagram.service';
import { FacebookService } from 'src/services/facebook/facebook.service';
import { ConnectedLinkedInPageParamDto } from 'src/dtos/params/connected-linkedin-page-param.dto';
import { FacebookPageAuthGuard } from 'src/shared/common/guards/facebook-page-auth/facebook-page-auth.guard';
import { InstagramAuthGuard } from 'src/shared/common/guards/instagram-auth/instagram-auth.guard';
import { ApiBody } from '@nestjs/swagger';
import { ImageUploadService } from 'src/services/image-upload/image-upload.service';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';
import { Response } from 'express';
import { FacebookPageDetailsDTO } from 'src/entities/facebook-page-details.entity';
import { InstagramPageDetailsDTO } from 'src/entities/instagram-page-details.entity';
import { DisconnectProfileDTO } from 'src/dtos/params/disconnect-profile-param.dto';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { SubscriptionService } from 'src/services/subscription/subscription.service';
import { ConfigService } from '@nestjs/config';
// import * as CryptoJS from 'crypto-js';
import { LinkedInTokenParamDto } from 'src/dtos/params/linkedin-token-data.dto';
import { FacebookConnectProfileParamDto } from 'src/dtos/params/facebook-connect-profile-param.dto';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { TOKEN_TYPE } from 'src/shared/constants/token-type-constants';

@Controller('link-page')
export class LinkPageController {
    public platformName: string;
    constructor(

        private configService: ConfigService,
        private readonly twitterService: TwitterService,
        private readonly unitOfWork: UnitOfWork,
        private readonly linkedinService: LinkedinService,
        private readonly instagramService: InstagramService,
        private readonly facebookService: FacebookService,
        private readonly imageUploadService: ImageUploadService,
        private readonly subscriptionService: SubscriptionService,
    ) { }

    @Get('twitter-login/:userId')
    async login(@Res() res: Response, @Param('userId') userId: number) {
        const { url } = await this.twitterService.getAuthorizationUrl(userId);
        res.redirect(url); // Redirect to the authorization URL
    }

    @Get('twitter-callback')
    async callback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Res() res: Response,
    ) {
        try {
            let isSuccess = false;
            const userId = state;

            const appUrl = this.configService.get<string>('APP_URL_FRONTEND');
            if (!code || !userId) {
                const redirectUrl =
                    `${appUrl}/user/link-social?` +
                    `isSuccess=${encodeURIComponent(isSuccess)}&` +
                    `error=${encodeURIComponent('Missing code or state')}`;
                return res.redirect(redirectUrl);
            }

            const tokenData = await this.twitterService.exchangeCodeForToken(code, userId);

            if (tokenData.status == 200) {
                isSuccess = true;

                // Check user has subscription
                const userHasSubscription = await this.subscriptionService.checkUserHasSubscription(parseInt(userId, 10));

                if (!userHasSubscription) {
                    // Create user trial period
                    await this.subscriptionService.saveUserTrialSubscription(parseInt(userId, 10));
                }

                await this.subscriptionService.findByUserAndPlatformAndSaveCredit(parseInt(userId, 10), SocialMediaPlatformNames[SocialMediaPlatform.TWITTER]);

                const redirectUrl =
                    `${appUrl}/user/link-social?isSuccess=${encodeURIComponent(isSuccess)}`;
                return res.redirect(redirectUrl);
            }

        } catch (error) {
            const isSuccess = false;
            const errorMessage =
                error.data?.message || 'An unexpected error occurred';

            const appUrl = this.configService.get<string>('APP_URL_FRONTEND');
            const redirectUrl =
                `${appUrl}/user/link-social?` +
                `isSuccess=${encodeURIComponent(isSuccess)}&` +
                `error=${encodeURIComponent(errorMessage)}`;
            res.redirect(redirectUrl);
        }
    }

    @Get('linkedin-login')
    async linkedinLogin(@Res() res: Response) {
        try {
            // Generate the LinkedIn authorization URL
            const url = await this.linkedinService.getLinkedInAuthUrl();
            res.redirect(url);
        } catch (error) {
            return `Error redirecting to LinkedIn authorization${error}`;
        }
    }

    @Get('linkedin-callback')
    async handleLinkedInCallback(
        @Query('code') code: string,
        @Res() res: Response,
    ) {
        try {
            const accessToken = await this.linkedinService.getAccessToken(
                code,
            );
            const urlParams = [];
            let isSuccess = false;
            if (accessToken.status == 200) {
                isSuccess = true;
                // Append any other parameters if necessary
                urlParams.push(`encrypted_access_token=${accessToken.data.access_token}`);
                urlParams.push(`refresh_token=${accessToken.data.refresh_token}`);
                urlParams.push(`refresh_token_expire_in=${accessToken.data.refresh_token_expires_in}`);
                urlParams.push(`expires_in=${accessToken.data.expires_in}`);
            }
            const appUrl = this.configService.get<string>('APP_URL_FRONTEND');
            let redirectUrl =
                `${appUrl}/user/link-social?` +
                `isSuccess=${encodeURIComponent(isSuccess)}`;
            // If we have any URL parameters, join them and append to the redirect URL
            if (urlParams.length > 0) {
                redirectUrl += '&';
                redirectUrl += urlParams.join('&');
            }

            res.redirect(redirectUrl);
            // return res.json(accessToken.data);
        } catch (error) {
            const isSuccess = false;
            const errorMessage =
                error.data?.message || 'An unexpected error occurred';
            const appUrl = this.configService.get<string>('APP_URL_FRONTEND');
            const redirectUrl =
                `${appUrl}/user/link-social?` +
                `isSuccess=${encodeURIComponent(isSuccess)}&` +
                `error=${encodeURIComponent(errorMessage)}`;
            res.redirect(redirectUrl);
        }
    }

    // Facebook  login for page link
    @Get('facebook-page')
    @UseGuards(FacebookPageAuthGuard)
    async facebookPageLogin() { }

    // Facebook  login  callback for page link
    @Get('facebook-page/callback')
    @UseGuards(FacebookPageAuthGuard)
    async facebookPageLoginCallback(@Req() req, @Res() res: Response) {
        const appUrl = this.configService.get<string>('APP_URL_FRONTEND');
        const error = req.query.error;
        const urlParams = [];
        if (error) {
            if (error === 'access_denied') {
                const isSuccess = false;
                const redirectUrl =
                    `${appUrl}/user/link-social?` +
                    `isSuccess=${encodeURIComponent(isSuccess)}`;
                res.redirect(redirectUrl);
            }
        }

        const longLivedFacebookProfileAccessToken =
            await this.facebookService.exchangeToLongLivedUserToken(
                req.user.accessToken,
            );

        const isSuccess = true;
        let redirectUrl =
            `${appUrl}/user/link-social?` +
            `isSuccess=${encodeURIComponent(isSuccess)}`;

        if (longLivedFacebookProfileAccessToken != null || longLivedFacebookProfileAccessToken != undefined) {
            urlParams.push(`facebook_profile_access_token=${longLivedFacebookProfileAccessToken}`);
            urlParams.push(`facebookId=${req.user.facebookId}`);
        }
        if (urlParams.length > 0) {
            redirectUrl += '&';
            redirectUrl += urlParams.join('&');
        }
        res.redirect(redirectUrl);
    }

    // Facebook login for group link
    @Get('facebook-group-link')
    @UseGuards(AuthGuard('facebook-group-link'))
    async facebookGroupLogin() { }

    // Facebook login callback for group link
    @Get('facebook-group-link/callback')
    @UseGuards(AuthGuard('facebook-group-link'))
    async facebookGroupLoginCallback(@Req() req, @Res() res: Response) {
        const appUrl = this.configService.get<string>('APP_URL_FRONTEND');
        const isSuccess = true;
        const redirectUrl =
            `${appUrl}/user/link-social?` +
            `isSuccess=${encodeURIComponent(isSuccess)}`;
        res.redirect(redirectUrl);
    }

    // instagram-link
    @Get('instagram-link')
    @UseGuards(InstagramAuthGuard)
    async instagramLogin() { }

    //instagram link callback
    @Get('instagram-link/callback')
    @UseGuards(InstagramAuthGuard)
    async instagramLoginCallback(@Req() req, @Res() res: Response) {

        const appUrl = this.configService.get<string>('APP_URL_FRONTEND');
        const error = req.query.error;
        if (error) {
            if (error === 'access_denied') {
                const isSuccess = false;
                const redirectUrl =
                    `${appUrl}/user/link-social?` +
                    `isSuccess=${encodeURIComponent(isSuccess)}`;
                res.redirect(redirectUrl);
                return;
            }
        }
        const longLivedFacebookProfileAccessToken =
            await this.facebookService.exchangeToLongLivedUserToken(
                req.user.accessToken,
            );

        const urlParams = [];

        const isSuccess = true;
        let redirectUrl =
            `${appUrl}/user/link-social?` +
            `isSuccess=${encodeURIComponent(isSuccess)}`;

        if (longLivedFacebookProfileAccessToken != null || longLivedFacebookProfileAccessToken != undefined) {
            urlParams.push(`facebook_profile_access_token=${longLivedFacebookProfileAccessToken}`);
            urlParams.push(`facebookId=${req.user.FacebookID}`);
        }
        if (urlParams.length > 0) {
            redirectUrl += '&';
            redirectUrl += urlParams.join('&');
        }
        res.redirect(redirectUrl);
    }

    // connect to the instagram
    @Post('connect-instagram')
    async connectInstagram(
        @Body() body: { pageId: string; accessToken: string },
    ) {
        const { pageId, accessToken } = body;
        const instagramAccount = await this.facebookService.getInstagramAccount(
            pageId,
            accessToken,
        );
        return instagramAccount;
    }

    @Get('pages/:userId/:platform')
    async getLinkedInPages(
        @Param('userId') userId: number,
        @Param('platform') platform: number,
        @Query('token') platformToken: string,
        @Query('facebookId') facebookId: string,
        @Req() req,
    ) {
        try {

            if (platform == SocialMediaPlatform.LINKEDIN) {
                return await this.linkedinService.getUserPages(
                    platformToken
                );
            } else if (platform == SocialMediaPlatform.FACEBOOK) {
                const facebookPageDetailsList = [];
                const accounts = await this.facebookService.getUserPages(platformToken);

                const bucketName = 'user';
                const folderName = `${userId}/facebook`;
                if (accounts.data) {
                    for (const account of accounts.data.data) {

                        const pageId = account.id;
                        const longLivedAccessToken =
                            await this.facebookService.exchangeToLongLivedUserToken(
                                account.access_token,
                            );
                        const longLivedFacebookProfileAccessToken = platformToken;
                        let pagePictureUrl: string | null = null;
                        try {
                            const pictureResponse =
                                await this.facebookService.getPagePicture(
                                    pageId,
                                    longLivedAccessToken,
                                );
                            pagePictureUrl = pictureResponse?.data?.url || null;
                            const { buffer, mimeType, fileName } =
                                await this.facebookService.fetchImageFromUrl(
                                    pagePictureUrl,
                                );

                            const file: Express.Multer.File = {
                                fieldname: 'file',
                                originalname: fileName,
                                encoding: '7bit',
                                mimetype: mimeType,
                                size: buffer.length,
                                buffer: buffer,
                                destination: '',
                                filename: fileName,
                                path: '',
                                stream: undefined as any,
                            };
                            const { publicUrl: imageUrl, filePath } =
                                await this.imageUploadService.uploadImage(
                                    bucketName,
                                    file,
                                    folderName,
                                );
                            const newPageDetail = {
                                access_token: longLivedAccessToken || null,
                                pageName: account.name || null,
                                pageId: account.id || null,
                                logoUrl: imageUrl,
                                isPage: true || null,
                                userId: userId || null,
                                faceBookId: facebookId || null,
                                filePath: filePath || null,
                                facebook_Profile_access_token:
                                    longLivedFacebookProfileAccessToken || null,
                            };
                            facebookPageDetailsList.push(newPageDetail);
                        } catch (error) {
                            throw error;
                        }
                    }
                }
                return facebookPageDetailsList;

            } else if (platform == SocialMediaPlatform.INSTAGRAM) {

                const instagramPageDetailsList = [];
                const accounts = await this.facebookService.getUserPages(platformToken);
                const longLivedFacebookProfileAccessToken = platformToken;
                if (accounts.data.data) {
                    for (const account of accounts.data.data) {
                        const pageId = account.id;
                        const pageAccessToken = account.access_token;
                        const data = await this.facebookService.getInstagramAccount(
                            pageId,
                            pageAccessToken,
                        );
                        const longLivedAccessToken =
                            await this.facebookService.exchangeToLongLivedUserToken(
                                account.access_token,
                            );

                        if (data.instagram_business_account) {
                            const instagramDetails =
                                await this.instagramService.getInstagramPageDetails(
                                    data.instagram_business_account.id,
                                    longLivedAccessToken,
                                );
                            const newPageDetail = {
                                access_token: longLivedAccessToken || null,
                                pageName: instagramDetails.name,
                                instagramId: data.instagram_business_account.id || null,
                                logoUrl: instagramDetails.profile_picture_url,
                                isPage: true || null,
                                userId: userId || null,
                                facebookPageId: data.id || null,
                                faceBookId: facebookId || null,
                                facebook_Profile_access_token:
                                    longLivedFacebookProfileAccessToken || null,
                            };
                            instagramPageDetailsList.push(newPageDetail);
                        }
                    }


                }
                return instagramPageDetailsList;
            } else {
                throw new HttpException(
                    'Invalid platform',
                    HttpStatus.BAD_REQUEST,
                );
            }
        } catch (error) {
            // Handle known error types or rethrow unexpected errors
            throw new HttpException(
                error.message || 'Failed to fetch LinkedIn pages',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Post('connect-profile')
    @ApiBody({ type: ConnectedLinkedInPageParamDto })
    async connectedLinkedinPage(
        @Req() req,
        @Body()
        body: {
            userId: number;
            pageId: string;
            isPage: boolean;
            platform: number;
            logoUrl: string;
            linkedInTokenParamDto?: LinkedInTokenParamDto;
            facebookConnectProfileParamDto?: FacebookConnectProfileParamDto;
        },
    ) {

        const { userId, pageId, isPage, platform, logoUrl } = body;
        try {
            if (platform == SocialMediaPlatform.LINKEDIN) {
                const { linkedInTokenParamDto } = body;
                await this.linkedinService.connectedLinkedinAccount(
                    userId,
                    pageId,
                    isPage,
                    logoUrl,
                    linkedInTokenParamDto
                );
            }
            else if (platform == SocialMediaPlatform.FACEBOOK) {
                const { facebookConnectProfileParamDto } = body;

                const facebookPageDetails = new FacebookPageDetailsDTO();
                facebookPageDetails.access_token = facebookConnectProfileParamDto.access_token;
                facebookPageDetails.faceBookId = facebookConnectProfileParamDto.faceBookId;
                facebookPageDetails.id = pageId;
                facebookPageDetails.isPage = isPage;
                facebookPageDetails.pageName = facebookConnectProfileParamDto.pageName;
                facebookPageDetails.userId = userId;
                facebookPageDetails.logoUrl = logoUrl;
                facebookPageDetails.filePath = facebookConnectProfileParamDto.filePath;
                facebookPageDetails.facebook_Profile_access_token = facebookConnectProfileParamDto.facebook_Profile_access_token;

                await this.facebookService.connectedFacebookAccount(facebookPageDetails);

            } else if (platform == SocialMediaPlatform.INSTAGRAM) {
                const { facebookConnectProfileParamDto } = body;

                const instagramPageData = new InstagramPageDetailsDTO();

                instagramPageData.access_token = facebookConnectProfileParamDto.access_token;
                instagramPageData.faceBookId = facebookConnectProfileParamDto.faceBookId;
                instagramPageData.instagramId = facebookConnectProfileParamDto.instagramId;
                instagramPageData.isPage = isPage;
                instagramPageData.pageName = facebookConnectProfileParamDto.pageName;
                instagramPageData.userId = userId;
                instagramPageData.logoUrl = logoUrl;
                instagramPageData.faceBookPageID = pageId;
                instagramPageData.facebook_Profile_access_token = facebookConnectProfileParamDto.facebook_Profile_access_token;

                await this.instagramService.connectedInstagramAccount(instagramPageData);
            }
            // else if (platform == SocialMediaPlatform.TWITTER) {
            //     return 'Twitter profile connected successfully.';
            // }

            //added condition to check user is able to create trial period
            const userHasSubscription = await this.subscriptionService.checkUserHasSubscription(userId);

            if (!userHasSubscription) {
                //create user trial period & user subscription creation in stripe
                await this.subscriptionService.saveUserTrialSubscription(userId);
            }

            //save user credit for later connected account
            await this.subscriptionService.findByUserAndPlatformAndSaveCredit(userId, SocialMediaPlatformNames[platform]);
            return `${SocialMediaPlatformNames[platform]} connected successfully`;

        } catch (error) {
                throw new HttpException(
                error.message || 'Failed to connect profile',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // @Get('twitter-user')
    // async getTwitterUser(@Query('bearerToken') bearerToken: string, @Query('userID') userID: number): Promise<any> {
    //     try {
    //         return await this.twitterService.getTwitterUserData(bearerToken, userID);
    //     } catch (error) {
    //         if (error instanceof HttpException) {
    //             throw error;
    //         } else {
    //             throw new HttpException('Unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
    //         }
    //     }
    // }

    // @Get('tweet-detail')
    // async getTweet(@Query('bearerToken') bearerToken: string, @Query('id') tweetId: string): Promise<any> {
    //     if (!tweetId) {
    //         throw new HttpException('Tweet ID is required', HttpStatus.BAD_REQUEST);
    //     }
    //     try {
    //         return await this.twitterService.getTweetDetails(bearerToken, tweetId);
    //     } catch (error) {
    //         if (error instanceof HttpException) {
    //             throw error;
    //         } else {
    //             throw new HttpException('Unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
    //         }
    //     }
    // }

    @Post('disconnectProfile')
    @ApiBody({
        description: 'User profile details to disconnect',
        type: DisconnectProfileDTO,
    })
    async disconnect(
        @Body() disconnectProfileDTO: DisconnectProfileDTO,
    ): Promise<string> {
        if (disconnectProfileDTO.platform == SocialMediaPlatform.FACEBOOK) {
            return this.facebookService.disconnectFacebookProfile(
                disconnectProfileDTO.userId,
            );
        } else if (
            disconnectProfileDTO.platform == SocialMediaPlatform.INSTAGRAM
        ) {
            return this.instagramService.disconnectInstagramProfile(
                disconnectProfileDTO.userId,
            );
        } else if (
            disconnectProfileDTO.platform == SocialMediaPlatform.LINKEDIN
        ) {
            return this.linkedinService.disconnectLinkedInProfile(
                disconnectProfileDTO.userId,
            );
        } else if (
            disconnectProfileDTO.platform == SocialMediaPlatform.TWITTER
        ) {
            return this.twitterService.disconnectTwitterProfile(
                disconnectProfileDTO.userId,
            );
        }
    }
}
