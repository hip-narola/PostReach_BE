import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SocialMediaInsightsService } from '../../services/social-media-insights/social-media-insights.service';
import { SocialMediaInsightParamDTO } from 'src/dtos/params/social-media-insights-param.dto';
import { DashboardInsightsService } from '../../services/dashboard-insights/dashboard-insights.service';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';
import { TwitterService } from 'src/services/twitter/twitter.service';
import { SocialMediaAccountService } from 'src/services/social-media-account/social-media-account.service';

@Processor('page-insight')
export class PageInsightProcessor extends WorkerHost {
    constructor(private readonly socialMediaService: SocialMediaInsightsService, private readonly dashboardInsightsService: DashboardInsightsService,
        private readonly twitterService: TwitterService,
        private readonly socialMediaAccountService: SocialMediaAccountService

    ) {
        super();
    }
    async process(job: Job<any>): Promise<void> {

        const socia_media_accounts = await this.socialMediaService.getUniqueUserIds();

        for (const socia_media_account of socia_media_accounts) {
            try {
                const userPage = await this.socialMediaService.userAccountInsight(socia_media_account.id);
                const data = await this.fetchData(socia_media_account);
                if (userPage) {
                    await this.updateDatabase(data, userPage.id);
                } else {
                    await this.createDataForNewDay(data);
                }
            } catch (error) {
            }
        }

        try {
            const twitterAccounts = await this.socialMediaAccountService.userTwitterAccounts();
            twitterAccounts.forEach(twitterAccount => {
                this.twitterService.refreshToken(twitterAccount);
            });

        } catch (error) {
        }
    }

    private async fetchData(socia_media_account: any) {
        try {
            if (socia_media_account.platform === SocialMediaPlatformNames[SocialMediaPlatform['FACEBOOK']]) {
                const facebookData = await this.dashboardInsightsService.getFacebookInsights(socia_media_account);
                if (facebookData) {
                    return this.mapToDto(facebookData, SocialMediaPlatformNames[SocialMediaPlatform['FACEBOOK']]);
                }
            } else if (socia_media_account.platform === SocialMediaPlatformNames[SocialMediaPlatform['INSTAGRAM']]) {
                const instagramData = await this.dashboardInsightsService.getinstagramInsights(socia_media_account);
                if (instagramData) {
                    return this.mapToDto(instagramData, SocialMediaPlatformNames[SocialMediaPlatform['INSTAGRAM']]);
                }
            }
            else if (socia_media_account.platform === SocialMediaPlatformNames[SocialMediaPlatform['LINKEDIN']]) {
                const linkedinData = await this.dashboardInsightsService.gelinkedInInsights(socia_media_account);
                if (linkedinData) {
                    return this.mapToDto(linkedinData, SocialMediaPlatformNames[SocialMediaPlatform['LINKEDIN']]);
                }
            }
            else if (socia_media_account.platform === SocialMediaPlatformNames[SocialMediaPlatform['TWITTER']]) {
                const twitterData = await this.dashboardInsightsService.getTwitterInsights(socia_media_account);
                if (twitterData) {
                    return this.mapToDto(twitterData, SocialMediaPlatformNames[SocialMediaPlatform['TWITTER']]);
                }


            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    }

    private async updateDatabase(data: any, id: number): Promise<void> {
        const socialMediaData = new SocialMediaInsightParamDTO();
        socialMediaData.platform = data.platform;
        socialMediaData.impressions = data.impressions;
        socialMediaData.newFollowers = data.newFollowers;
        socialMediaData.engagements = data.engagements;
        socialMediaData.social_media_account_id = data.social_media_account_id;
        await this.socialMediaService.update(id, socialMediaData);
    }

    private async createDataForNewDay(data: any): Promise<void> {
        const socialMediaData = new SocialMediaInsightParamDTO();
        socialMediaData.platform = data.platform;
        socialMediaData.impressions = data.impressions;
        socialMediaData.newFollowers = data.newFollowers;
        socialMediaData.engagements = data.engagements;
        socialMediaData.social_media_account_id = data.social_media_account_id;
        socialMediaData.social_media_account_id = data.social_media_account_id;

        await this.socialMediaService.create(socialMediaData);
    }

    private mapToDto(data: any, platform: string): SocialMediaInsightParamDTO {
        const dto = new SocialMediaInsightParamDTO();
        dto.platform = platform;
        dto.impressions = data.impressions || 0;
        dto.newFollowers = data.newFollowers || 0;
        // dto.engagements = data.engagements || 0;
        dto.engagements = data.engagements ? parseFloat(data.engagements.toFixed(2)) : 0;
        dto.social_media_account_id = data.social_media_account_id;
        return dto;
    }

}
