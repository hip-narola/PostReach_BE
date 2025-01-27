import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { GetSocilInsightsParamDto } from 'src/dtos/params/get-social-insights-param.dto';
import { PostToInstagramDto } from 'src/dtos/params/post-to-instagram.dto';
import { CheckUserSubscriptionService } from 'src/services/check-user-subscription/check-user-subscription.service';
import { DashboardInsightsService } from 'src/services/dashboard-insights/dashboard-insights.service';
import { FacebookService } from 'src/services/facebook/facebook.service';
import { InstagramService } from 'src/services/instagram/instagram.service';
import { SocialMediaInsightsService } from 'src/services/social-media-insights/social-media-insights.service';

@Controller('dashboard-insights')
export class DashboardInsightsController {

    constructor(private readonly dashboardInsightsService: DashboardInsightsService, private readonly socialMediaInsightsService: SocialMediaInsightsService, private readonly facebookService: FacebookService, private readonly instagramService: InstagramService,
        private readonly checkUserSubscriptionService: CheckUserSubscriptionService
    ) { }

    // count apis for facebook
    @Get('getTotalFacebookPostList')
    @ApiQuery({ name: 'userid', type: Number, required: true, description: 'User ID to fetch Facebook posts' })
    async getTotalFacebookPostList(@Query('userid') userid: number): Promise<number> {
        return await this.dashboardInsightsService.getTotalFacebookPostList(userid);
    }

    @Get('getTotalFacebookApprovedPostList')
    @ApiQuery({ name: 'userid', type: Number, required: true, description: 'User ID to fetch Facebook posts' })
    async getTotalFacebookApprovedPostList(@Query('userid') userid: number): Promise<number> {
        return await this.dashboardInsightsService.getTotalFacebookApprovedPostList(userid);
    }

    @Get('getTotalFacebookRejectedPostList')
    @ApiQuery({ name: 'userid', type: Number, required: true, description: 'User ID to fetch Facebook posts' })
    async getTotalFacebookRejectedPostList(@Query('userid') userid: number): Promise<number> {
        return await this.dashboardInsightsService.getTotalFacebookRejectedPostList(userid);
    }


    // count apis for linkedin
    @Get('getTotalLinkedinPostList')
    @ApiQuery({ name: 'userid', type: Number, required: true, description: 'User ID to fetch linkedin posts' })
    async getTotalLinkedinPostList(@Query('userid') userid: number): Promise<number> {
        return await this.dashboardInsightsService.getTotalLinkedinPostList(userid);
    }

    @Get('getTotalLinkedinApprovedPostList')
    @ApiQuery({ name: 'userid', type: Number, required: true, description: 'User ID to fetch linkedin posts' })
    async getTotalLinkedinApprovedPostList(@Query('userid') userid: number): Promise<number> {
        return await this.dashboardInsightsService.getTotalLinkedinApprovedPostList(userid);
    }

    @Get('getTotalLinkedinRejectedPostList')
    @ApiQuery({ name: 'userid', type: Number, required: true, description: 'User ID to fetch linkedin posts' })
    async getTotalLinkedinRejectedPostList(@Query('userid') userid: number): Promise<number> {
        return await this.dashboardInsightsService.getTotalLinkedinRejectedPostList(userid);
    }


    // count apis for twitter

    @Get('getTotalTwitterPostList')
    @ApiQuery({ name: 'userid', type: Number, required: true, description: 'User ID to fetch twitter posts' })
    async getTotalTwitterPostList(@Query('userid') userid: number): Promise<number> {
        return await this.dashboardInsightsService.getTotalTwitterPostList(userid);
    }

    @Get('getTotalTwitterApprovedPostList')
    @ApiQuery({ name: 'userid', type: Number, required: true, description: 'User ID to fetch twitter posts' })
    async getTotalTwitterApprovedPostList(@Query('userid') userid: number): Promise<number> {
        return await this.dashboardInsightsService.getTotalTwitterApprovedPostList(userid);
    }

    @Get('getTotalTwitterRejectedPostList')
    @ApiQuery({ name: 'userid', type: Number, required: true, description: 'User ID to fetch twitter posts' })
    async getTotalTwitterRejectedPostList(@Query('userid') userid: number): Promise<number> {
        return await this.dashboardInsightsService.getTotalTwitterRejectedPostList(userid);
    }

    // count apis for instagram

    @Get('getTotalInstagramPostList')
    @ApiQuery({ name: 'userid', type: Number, required: true, description: 'User ID to fetch instagram posts' })
    async getTotalInstagramPostList(@Query('userid') userid: number): Promise<number> {
        return await this.dashboardInsightsService.getTotalInstagramPostList(userid);
    }

    @Get('getTotalInstagramApprovedPostList')
    @ApiQuery({ name: 'userid', type: Number, required: true, description: 'User ID to fetch instagram posts' })
    async getTotalInstagramApprovedPostList(@Query('userid') userid: number): Promise<number> {
        return await this.dashboardInsightsService.getTotalInstagramApprovedPostList(userid);
    }

    @Get('getTotalInstagramRejectedPostList')
    @ApiQuery({ name: 'userid', type: Number, required: true, description: 'User ID to fetch instagram posts' })
    async getTotalInstagramRejectedPostList(@Query('userid') userid: number): Promise<number> {
        return await this.dashboardInsightsService.getTotalInstagramRejectedPostList(userid);
    }

    // get insights  for all social media accounts

    @Post('getSocialinsightsList')
    @ApiBody({ type: GetSocilInsightsParamDto })
    async getSocialinsightsList(@Body() GetSocilInsightsParamDto: { days: number, userId: number, platform: number | null }): Promise<any> {
        return await this.socialMediaInsightsService.getSocialinsightsList(GetSocilInsightsParamDto);
    }

    @Post('post')
    @ApiBody({ type: PostToInstagramDto })
    async postToInstagram(@Body() postToInstagramDto: PostToInstagramDto) {
        const { postId, igUserId, accessToken, imageUrl, content, hashtags } = postToInstagramDto;
        try {
            await this.instagramService.postToInstagram(postId, igUserId, accessToken, imageUrl, content, hashtags);
            return { message: 'Post successful' };
        } catch (error) {
            return { message: 'Error posting to Instagram', error: error.message };
        }
    }

    @Get('Instagram-post-metrics')
    async getPostMetrics(@Query('mediaId') mediaId: string, @Query('accessToken') accessToken: string) {
        if (!mediaId) {
            throw new Error('mediaId is required');
        }
        return await this.instagramService.getPostMetrics(mediaId, accessToken);
    }
}