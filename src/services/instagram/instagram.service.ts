import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { SocialTokenDataDTO } from 'src/dtos/params/social-token-data-dto';
import { SocialMediaAccountService } from '../social-media-account/social-media-account.service';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { PostRepository } from 'src/repositories/post-repository';
import { Post } from 'src/entities/post.entity';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';
import { AwsSecretsService } from '../aws-secrets/aws-secrets.service';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';
import { TOKEN_TYPE } from 'src/shared/constants/token-type-constants';
import { InstagramPageDetailsDTO } from 'src/entities/instagram-page-details.entity';
import { Logger } from '../logger/logger.service';
@Injectable()
export class InstagramService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private readonly apiVersion: string = 'v18.0';
  private readonly facebookApiUrl = 'https://graph.facebook.com/v21.0';

  constructor(private readonly socialMediaAccountService: SocialMediaAccountService, private readonly unitOfWork: UnitOfWork, private readonly secretService: AwsSecretsService, private readonly logger: Logger
  ) {
    this.initialize();
  }

  private async initialize() {
    const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
    this.clientId = secretData.INSTAGRAM_APP_ID;
    this.clientSecret = secretData.INSTAGRAM_APP_SECRET;
    this.redirectUri = secretData.INSTAGRAM_CALLBACK;
  }

  getAuthUrl(): string {
    const scopes = ['user_profile', 'user_media'];
    return `https://api.instagram.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${scopes.join(',')}&response_type=code`;
  }

  async getAccessToken(code: string): Promise<any> {
    try {
      const response = await axios.post('https://api.instagram.com/oauth/access_token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code,
      });

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error` +
        error.stack || error.message,
        'GetAccessToken'
      );
      throw new Error('Failed to get access token');
    }
  }

  async getUserProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error` +
        error.stack || error.message,
        'getUserProfile'
      );
      throw new Error('Failed to get user profile');
    }
  }


  async saveInstagramId(pageId: string, pageAccessToken: string, instagramId: string, platform: string, facebookId: string, userId: number) {
    const tokenDataDTO = new SocialTokenDataDTO({
      page_id: pageId,
      facebook_Profile: facebookId,
      access_token: pageAccessToken,
      token_type: TOKEN_TYPE.INSTAGRAM_ID,
      instagram_Profile: instagramId,
      expires_in: null,
      scope: null
    });

    await this.socialMediaAccountService.storeTokenDetails(userId, tokenDataDTO, platform);
    return true;
  }


  async postToInstagram(PostId: number, igUserId: string, accessToken: string, imageUrl: string, content = '', hashtags = []) {
    try {

      // Step 1: Validate required fields
      if (!imageUrl) {
        throw new Error('Image URL is required');
      }

      // Step 2: Construct caption (content + hashtags)
      let caption = content;
      if (hashtags.length > 0) {
        caption += `\n${hashtags.map(tag => `${tag}`).join(' ')}`;
      }

      // Step 3: Upload media
      const mediaResponse = await axios.post(
        `https://graph.facebook.com/v21.0/${igUserId}/media`,
        {
          image_url: imageUrl,
          caption: caption,
        },
        {
          params: { access_token: accessToken },
        }
      );
      const containerId = mediaResponse.data.id;
      // Step 4: Publish media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v21.0/${igUserId}/media_publish`,
        {
          creation_id: containerId,
        },
        {
          params: { access_token: accessToken },
        }
      );

      await this.unitOfWork.startTransaction();
      const socialMediaInsightsRepo = this.unitOfWork.getRepository(PostRepository, Post, true);
      const record = await socialMediaInsightsRepo.findOne(PostId);
      record.external_platform_id = publishResponse.data.id;
      await socialMediaInsightsRepo.update(PostId, record);
      await this.unitOfWork.completeTransaction();

    } catch (error) {
      // await this.unitOfWork.rollbackTransaction();
      if (axios.isAxiosError(error)) {

        this.logger.error(
          `Error` +
          error.stack || error.message,
          'PostToFacebook'
        );
      
      } else {
      
        this.logger.error(
          `Error` +
          error.stack || error.message,
          'PostToFacebook'
        );

      }
    }
  }


  async fetchAndUpdateInstagramPostData(posts: Post[]) {
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
          const postDetails = await this.getPostMetrics(
            post.external_platform_id,
            socialMediaAccount.encrypted_access_token,
          );
          const record = await postRepository.findOne(post.id);
          record.no_of_comments = postDetails.comments;
          record.no_of_likes = postDetails.likes;
          record.no_of_views = postDetails.impressions;
          await postRepository.update(post.id, record);
        } catch (error) {
          this.logger.error(
            `Error` +
            error.stack || error.message,
            'fetchAndUpdateInstagramPostData'
          );
          await this.unitOfWork.rollbackTransaction();
        }
      }

      await this.unitOfWork.completeTransaction();
    }
    catch (error) {
      this.logger.error(
        `Error` +
        error.stack || error.message,
        'fetchAndUpdateInstagramPostData'
      );
      await this.unitOfWork.rollbackTransaction();
    }
  }


  async getPostMetrics(mediaId: string, accessToken: string) {
    try {
      // Fetch like and comment counts
      const mediaResponse = await axios.get(`${this.facebookApiUrl}/${mediaId}`, {
        params: {
          fields: 'like_count,comments_count',
          access_token: accessToken,
        },
      });

      // Fetch video insights
      const insightsResponse = await axios.get(
        `${this.facebookApiUrl}/${mediaId}/insights`,
        {
          params: {
            metric: 'impressions',
            access_token: accessToken,
          },
        },
      );

      // Process responses
      const { like_count, comments_count } = mediaResponse.data;
      const insights = insightsResponse.data.data.reduce((acc, item) => {
        acc[item.name] = item.values[0].value;
        return acc;
      }, {});

      return {
        likes: like_count,
        comments: comments_count,
        impressions: insights.impressions || 0,
      };
    } catch (error) {
      this.logger.error(
        `Error` +
        error.stack || error.message,
        'PostMetrics'
      );

    }
  }

  async connectedInstagramAccount(instagramPageData: InstagramPageDetailsDTO) {
    try {
      await this.unitOfWork.startTransaction();
      const socialMediaAccountRepository = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, true);

      const userSocialAccount = await this.socialMediaAccountService.findSocialAccountForConnectAndDisconnectProfile(instagramPageData.userId, SocialMediaPlatformNames[SocialMediaPlatform.INSTAGRAM], false);
      if (!userSocialAccount) {

        const instagramDetails = new SocialMediaAccount();
        instagramDetails.encrypted_access_token = instagramPageData.access_token;
        instagramDetails.facebook_Profile = instagramPageData.faceBookId;
        instagramDetails.page_id = instagramPageData.faceBookPageID;
        instagramDetails.platform = SocialMediaPlatformNames[SocialMediaPlatform.INSTAGRAM];
        instagramDetails.user_id = instagramPageData.userId;
        instagramDetails.user_name = instagramPageData.pageName;
        instagramDetails.user_profile = instagramPageData.logoUrl;
        instagramDetails.instagram_Profile = instagramPageData.instagramId;
        instagramDetails.token_type = TOKEN_TYPE.INSTAGRAM_ID;
        instagramDetails.facebook_Profile_access_token = instagramPageData.facebook_Profile_access_token;

        await socialMediaAccountRepository.create(instagramDetails);
      }
      else {
        userSocialAccount.encrypted_access_token = instagramPageData.access_token;
        userSocialAccount.facebook_Profile = instagramPageData.faceBookId;
        userSocialAccount.page_id = instagramPageData.faceBookPageID;
        userSocialAccount.platform = SocialMediaPlatformNames[SocialMediaPlatform.INSTAGRAM];
        userSocialAccount.user_id = instagramPageData.userId;
        userSocialAccount.user_name = instagramPageData.pageName;
        userSocialAccount.user_profile = instagramPageData.logoUrl;
        userSocialAccount.instagram_Profile = instagramPageData.instagramId;
        userSocialAccount.token_type = TOKEN_TYPE.INSTAGRAM_ID;
        userSocialAccount.facebook_Profile_access_token = instagramPageData.facebook_Profile_access_token;

        await socialMediaAccountRepository.update(userSocialAccount.id, userSocialAccount);

      }
      await this.unitOfWork.completeTransaction();
    } catch (error: any) {
      this.logger.error(
        `Error` +
        error.stack || error.message,
        'connectedInstagramAccount'
      );
      await this.unitOfWork.rollbackTransaction();
      throw new Error(`Failed to save connected page: ${error.message}`);
    }
  }


  async getInstagramPageDetails(instagramAccountId: string, accessToken: string): Promise<any> {
    try {
      const instagramAccountDetails = await axios.get(
        `https://graph.facebook.com/v21.0/${instagramAccountId}?fields=name,profile_picture_url&access_token=${accessToken}`,
      );
      return instagramAccountDetails.data;
    } catch (error) {
      this.logger.error(
        `Error` +
        error.stack || error.message,
        'getInstagramPageDetails'
      );
      throw error;
    }
  }


  async disconnectInstagramProfile(userId: number): Promise<string> {
    try {
      const userSocialAccount = await this.socialMediaAccountService.findSocialAccountForConnectAndDisconnectProfile(userId, SocialMediaPlatformNames[SocialMediaPlatform.INSTAGRAM], false);

      if (!userSocialAccount) {
        throw new HttpException('No Facebook profile linked to this user.', HttpStatus.NOT_FOUND);
      }
      await this.revokePermissions(userSocialAccount.facebook_Profile, userSocialAccount.facebook_Profile_access_token);
      await this.unitOfWork.startTransaction();
      const socialMediaAccountRepo = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, true);
      userSocialAccount.isDisconnect = true;
      await socialMediaAccountRepo.update(userSocialAccount.id, userSocialAccount);
      await this.unitOfWork.completeTransaction();
      return 'instagram profile disconnected successfully.';
    }
    catch (error) {
      this.logger.error(
        `Error` +
        error.stack || error.message,
        'disconnectInstagramProfile'
      );
      await this.unitOfWork.rollbackTransaction();
      throw error;
    }
  }

  private async revokePermissions(id: string, accessToken: string): Promise<void> {
    try {
      const url = `https://graph.facebook.com/v21.0/${id}/permissions?access_token=${accessToken}`;
      const response = await axios.delete(url);
      if (response.status !== 200) {
        throw new Error(`Failed to revoke permissions for user ${id}.`);
      }
    }
    catch (error) {
      this.logger.error(
        `Error` +
        error.stack || error.message,
        'revokePermissions'
      );
      throw error;
    }
  }

}
