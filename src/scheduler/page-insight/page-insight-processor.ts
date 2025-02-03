import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SocialMediaInsightsService } from '../../services/social-media-insights/social-media-insights.service';
import { SocialMediaInsightParamDTO } from 'src/dtos/params/social-media-insights-param.dto';
import { DashboardInsightsService } from '../../services/dashboard-insights/dashboard-insights.service';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';
import { TwitterService } from 'src/services/twitter/twitter.service';

@Processor('page-insight')
export class PageInsightProcessor extends WorkerHost {
    constructor(private readonly socialMediaService: SocialMediaInsightsService, private readonly dashboardInsightsService: DashboardInsightsService,
        private readonly twitterService: TwitterService
    ) {
        super();
    }

    async process(job: Job<any>): Promise<void> {

        const sociaMediaAccounts = await this.socialMediaService.getActiveSocialMediaAccountAsync();
        for (const account of sociaMediaAccounts) {
            try {

                let insightData: SocialMediaInsightParamDTO;
                if (account.platform === SocialMediaPlatformNames[SocialMediaPlatform['FACEBOOK']]) {
                    insightData = await this.dashboardInsightsService.getFacebookInsights(account);
                } else if (account.platform === SocialMediaPlatformNames[SocialMediaPlatform['INSTAGRAM']]) {
                    insightData = await this.dashboardInsightsService.getinstagramInsights(account);
                } else if (account.platform === SocialMediaPlatformNames[SocialMediaPlatform['LINKEDIN']]) {
                    insightData = await this.dashboardInsightsService.gelinkedInInsights(account);
                } else if (account.platform === SocialMediaPlatformNames[SocialMediaPlatform['TWITTER']]) {
                    insightData = await this.dashboardInsightsService.getTwitterInsights(account);
                }

                if (insightData) {
                    const userPage = await this.socialMediaService.userAccountInsight(account.id);
                    if (userPage) {
                        await this.socialMediaService.update(userPage.id, insightData);
                    } else {
                        await this.socialMediaService.create(insightData);
                    }
                }
            } catch (error) {
                console.log("ERROR IN page-insight processor: ", error);
            }
        }

        // refresh Twitter token
        try {
            const twitterAccounts = await this.socialMediaService.getActiveSocialMediaAccountAsync(SocialMediaPlatformNames[SocialMediaPlatform['TWITTER']]);
            twitterAccounts.forEach(twitterAccount => {
                this.twitterService.refreshToken(twitterAccount);
            });

        } catch (error) {
            console.log("ERROR IN page-insight processor for refresh twitter account: ", error);
        }
    }
}