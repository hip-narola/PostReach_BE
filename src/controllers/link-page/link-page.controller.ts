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
import { Request, Response } from 'express';
import { FacebookPageDetailsDTO } from 'src/entities/facebook-page-details.entity';
import { InstagramPageDetailsDTO } from 'src/entities/instagram-page-details.entity';
import { DisconnectProfileDTO } from 'src/dtos/params/disconnect-profile-param.dto';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { LinkedInPagesParamDto } from 'src/dtos/params/linkedin-pages-param.dto';
import { SubscriptionService } from 'src/services/subscription/subscription.service';
import { ConfigService } from '@nestjs/config';

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

    @Get('twitter-login')
    async login(@Res() res: Response, @Req() req: Request) {
        const { url } = await this.twitterService.getAuthorizationUrl(req);
        res.redirect(url); // Redirect to the authorization URL
    }

    @Get('twitter-callback')
    async callback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const userId = parseInt(req.session.userId, 10);
            let isSuccess = false;
            const appUrl = this.configService.get<string>('APP_URL_FRONTEND');
            if (!code || !state) {
                const redirectUrl =
                    `${appUrl}/user/link-social?` +
                    `isSuccess=${encodeURIComponent(isSuccess)}&` +
                    `error=${encodeURIComponent('Missing code or state')}`;
                return res.redirect(redirectUrl);
            }
            const tokenData = await this.twitterService.exchangeCodeForToken(
                code,
                state,
                userId,
                req,
            );
            if (tokenData.status == 200) {
                isSuccess = true;

                //check user is able to create trial subscription
                const userHasSubscription = await this.subscriptionService.checkUserHasSubscription(userId);

                if (!userHasSubscription) {
                    //create user trial period
                    await this.subscriptionService.saveUserTrialSubscription(userId);
                }

                await this.subscriptionService.findByUserAndPlatformAndSaveCredit(userId, SocialMediaPlatformNames[SocialMediaPlatform.TWITTER]);

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
            res.status(500).json({
                message: 'Error redirecting to LinkedIn authorization',
            });
        }
    }

    @Get('linkedin-callback')
    async handleLinkedInCallback(
        @Query('code') code: string,
        @Res() res: Response,
        @Req() req,
    ) {
        try {
            const userId = parseInt(req.session.userId, 10);
            const accessToken = await this.linkedinService.getAccessToken(
                code,
                userId,
            );

            let isSuccess = false;
            if (accessToken.status == 200) {
                isSuccess = true;
            }
            const appUrl = this.configService.get<string>('APP_URL_FRONTEND');
            const redirectUrl =
                `${appUrl}/user/link-social?` +
                `isSuccess=${encodeURIComponent(isSuccess)}`;
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
        const facebookPageDetailsList = [];
        const userId = parseInt(req.session.userId, 10);
        const appUrl = this.configService.get<string>('APP_URL_FRONTEND');
        const error = req.query.error;
        if (error) {
            if (error === 'access_denied') {
                const isSuccess = false;
                const redirectUrl =
                    `${appUrl}/user/link-social?` +
                    `isSuccess=${encodeURIComponent(isSuccess)}`;
                res.redirect(redirectUrl);
            }
        }
        const accounts = req.user?.accounts;
        if (!accounts || !accounts.data || accounts.data.length === 0) {
            const isSuccess = false;
            const redirectUrl =
                `${appUrl}/user/link-social?` +
                `isSuccess=${encodeURIComponent(isSuccess)}`;
            res.redirect(redirectUrl);
        }
        const bucketName = 'user';
        const folderName = `${userId}/facebook`;
        if (accounts.data && accounts.data.length > 0) {
            for (const account of accounts.data) {
                const pageId = account.id;
                const longLivedAccessToken =
                    await this.facebookService.exchangeToLongLivedUserToken(
                        account.access_token,
                    );
                const longLivedFacebookProfileAccessToken =
                    await this.facebookService.exchangeToLongLivedUserToken(
                        req.user.accessToken,
                    );
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
                        id: account.id || null,
                        logoUrl: imageUrl,
                        isPage: true || null,
                        userId: userId || null,
                        faceBookId: req.user.facebookId || null,
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
        req.session.facebookPageDetails = JSON.stringify(
            facebookPageDetailsList,
        );
        const isSuccess = true;
        const redirectUrl =
            `${appUrl}/user/link-social?` +
            `isSuccess=${encodeURIComponent(isSuccess)}`;
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
        const instagramPageDetailsList = [];
        const userId = parseInt(req.session.userId, 10);
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
        const accounts = req.user?.accounts;
        if (!accounts || !accounts.data || accounts.data.length === 0) {
            const isSuccess = false;
            const redirectUrl =
                `${appUrl}/user/link-social?` +
                `isSuccess=${encodeURIComponent(isSuccess)}`;
            res.redirect(redirectUrl);
            return;
        }
        if (accounts.data && accounts.data.length > 0) {
            for (const account of accounts.data) {
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
                const longLivedFacebookProfileAccessToken =
                    await this.facebookService.exchangeToLongLivedUserToken(
                        req.user.accessToken,
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
                        faceBookId: req.user.FacebookID || null,
                        facebook_Profile_access_token:
                            longLivedFacebookProfileAccessToken || null,
                    };
                    instagramPageDetailsList.push(newPageDetail);
                }
            }
            req.session.instagramPageDetails = JSON.stringify(
                instagramPageDetailsList,
            );
        }
        const isSuccess = true;
        const redirectUrl =
            `${appUrl}/user/link-social?` +
            `isSuccess=${encodeURIComponent(isSuccess)}`;
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
    @ApiBody({ type: LinkedInPagesParamDto })
    async getLinkedInPages(
        @Param('userId') userId: number,
        @Param('platform') platform: number,
        @Req() req,
    ) {
        try {
            if (platform == SocialMediaPlatform.LINKEDIN) {
                return await this.linkedinService.getUserPages(
                    userId,
                    platform,
                );
            } else if (platform == SocialMediaPlatform.FACEBOOK) {
                if (req.session.facebookPageDetails) {
                    try {
                        const facebookPageList = JSON.parse(
                            req.session.facebookPageDetails,
                        );
                        const formattedDetails = facebookPageList.map(
                            (detail) => ({
                                pageId: detail.id || null,
                                pageName: detail.pageName || null,
                                logoUrl: detail.logoUrl || null,
                                isPage: detail.isPage || null,
                            }),
                        );
                        return formattedDetails;
                    } catch (error) {
                        throw error;
                    }
                }
            } else if (platform == SocialMediaPlatform.INSTAGRAM) {
                if (req.session.instagramPageDetails) {
                    try {
                        const instagramPageList = JSON.parse(
                            req.session.instagramPageDetails,
                        );
                        const formattedDetails = instagramPageList.map(
                            (detail) => ({
                                pageId: detail.instagramId || null,
                                pageName: detail.pageName || null,
                                logoUrl: detail.logoUrl || null,
                                isPage: detail.isPage || null,
                            }),
                        );
                        return formattedDetails;
                    } catch (error) {
                        throw error;
                    }
                }
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
        },
    ) {
        const { userId, pageId, isPage, platform, logoUrl } = body;
        try {
            if (platform == SocialMediaPlatform.LINKEDIN) {
                await this.linkedinService.connectedLinkedinAccount(
                    userId,
                    pageId,
                    isPage,
                    logoUrl,
                );

            }
            else if (platform == SocialMediaPlatform.FACEBOOK) {
                const facebookDetails = JSON.parse(req.session.facebookPageDetails);
                const matchingDetails = facebookDetails.find(
                    (detail) =>
                        detail.id === pageId && detail.userId === userId,
                );
                if (matchingDetails == undefined) {
                    throw new HttpException(
                        'No Record Found',
                        HttpStatus.BAD_REQUEST,
                    );
                }
                const facebookPageDetails = new FacebookPageDetailsDTO();
                facebookPageDetails.access_token = matchingDetails.access_token;
                facebookPageDetails.faceBookId = matchingDetails.faceBookId;
                facebookPageDetails.id = matchingDetails.id;
                facebookPageDetails.isPage = matchingDetails.isPage;
                facebookPageDetails.pageName = matchingDetails.pageName;
                facebookPageDetails.userId = matchingDetails.userId;
                facebookPageDetails.logoUrl = matchingDetails.logoUrl;
                facebookPageDetails.filePath = matchingDetails.filePath;
                facebookPageDetails.facebook_Profile_access_token =
                    matchingDetails.facebook_Profile_access_token;
                await this.facebookService.connectedFacebookAccount(
                    facebookPageDetails,
                );
            } else if (platform == SocialMediaPlatform.INSTAGRAM) {
                const instagramDetails = JSON.parse(
                    req.session.instagramPageDetails,
                );
                const matchingDetails = instagramDetails.find(
                    (detail) =>
                        detail.instagramId === pageId &&
                        detail.userId === userId,
                );
                if (matchingDetails == undefined) {
                    throw new HttpException(
                        'No Record Found',
                        HttpStatus.BAD_REQUEST,
                    );
                }
                const instagramPageData = new InstagramPageDetailsDTO();
                instagramPageData.access_token = matchingDetails.access_token;
                instagramPageData.faceBookId = matchingDetails.faceBookId;
                instagramPageData.instagramId = matchingDetails.instagramId;
                instagramPageData.isPage = matchingDetails.isPage;
                instagramPageData.pageName = matchingDetails.pageName;
                instagramPageData.userId = matchingDetails.userId;
                instagramPageData.logoUrl = matchingDetails.logoUrl;
                instagramPageData.faceBookPageID = matchingDetails.facebookPageId;
                instagramPageData.facebook_Profile_access_token = matchingDetails.facebook_Profile_access_token;
                await this.instagramService.connectedInstagramAccount(instagramPageData);
            }
            else if (platform == SocialMediaPlatform.TWITTER) {
                return 'Twitter profile connected successfully.';
            }
            else {

            }

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

    @Get('connected-tweet-post')
    async main() {
        const imageUrl =
            'https://owehwuxrqdrgsfvzwwdl.supabase.co/storage/v1/object/public/user/22/business/image_Fh.png';

        try {
            // Step 1: Upload the media
            await this.twitterService.uploadMedia2(imageUrl);

            // Step 2: Post the tweet with the uploaded media
            // const tweetResponse = await this.twitterService.postTweet2(content, mediaId);
            // const post1Insights = await this.twitterService.getAccount1Insights(tweetResponse.data.id);
        } catch (error) {
            throw error;
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
