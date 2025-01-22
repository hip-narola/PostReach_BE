import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SocialMediaInsightsService } from '../../services/social-media-insights/social-media-insights.service';
import { SocialMediaInsightParamDTO } from 'src/dtos/params/social-media-insights-param.dto';
import { DashboardInsightsService } from '../../services/dashboard-insights/dashboard-insights.service';

@Processor('page-insight')
export class PageInsightProcessor extends WorkerHost {
    constructor(private readonly socialMediaService: SocialMediaInsightsService, private readonly dashboardInsightsService: DashboardInsightsService) {
        super();
    }
    async process(job: Job<any>): Promise<void> {
        console.log("page-insight started:: ", job);
        try {
            const data = await this.fetchData();
            console.log("page-insight data:: ", data);
            if (this.isNewDay()) {
                for (const insight of data) {
                    await this.createDataForNewDay(insight);
                }
            }
            else {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                for (const insight of data) {
                    const existingEntry = await this.socialMediaService.findEntryByDate(todayStart, insight.social_media_account_id);
                    if (existingEntry == null || existingEntry == undefined) {
                        await this.createDataForNewDay(insight);
                    }
                    else {
                        await this.updateDatabase(insight, existingEntry.id);
                    }
                }
            }
        } catch (error) {
            console.log("page-insight error:: ", error);
        }

    }

    private async fetchData(): Promise<any> {
        console.log("page-insight fetchData started:: ");
        try {

            const userids = await this.socialMediaService.getUniqueUserIds();
            const insights = [];

            for (const userID of userids) {
                try {
                    // Step 4: Fetch Facebook Insights
                    const facebookData = await this.dashboardInsightsService.getFacebookInsights(userID, 'facebook');
                    if (facebookData) {
                        const facebookInsight = new SocialMediaInsightParamDTO();
                        facebookInsight.platform = "facebook";
                        facebookInsight.impressions = facebookData.impressions || 0;
                        facebookInsight.newFollowers = facebookData.newFollowers || 0;
                        facebookInsight.engagements = facebookData.engagements || 0;
                        facebookInsight.social_media_account_id = facebookData.social_media_account_id;
                        insights.push(facebookInsight);
                    }

                    // Step 5: Fetch Instagram Insights
                    const instagramData = await this.dashboardInsightsService.getinstagramInsights(userID, 'instagram');
                    if (instagramData) {
                        const instagramInsight = new SocialMediaInsightParamDTO();
                        instagramInsight.platform = "instagram";
                        instagramInsight.impressions = instagramData.impressions || 0;
                        instagramInsight.newFollowers = instagramData.newFollowers || 0;
                        instagramInsight.engagements = instagramData.engagements || 0;
                        instagramInsight.social_media_account_id = instagramData.social_media_account_id;
                        insights.push(instagramInsight);
                    }

                    const linkedinData = await this.dashboardInsightsService.gelinkedInInsights(userID, 'linkedIn');
                    if (linkedinData) {
                        const linkedInsight = new SocialMediaInsightParamDTO();
                        linkedInsight.platform = "linkedIn";
                        linkedInsight.impressions = linkedInsight.impressions || 0;
                        linkedInsight.newFollowers = linkedInsight.newFollowers || 0;
                        linkedInsight.engagements = linkedInsight.engagements || 0;
                        linkedInsight.social_media_account_id = linkedInsight.social_media_account_id;
                        insights.push(linkedInsight);
                    }

                    const twitterData = await this.dashboardInsightsService.getTwitterInsights(userID, 'twitter');
                    if (twitterData) {
                        const twitterInsight = new SocialMediaInsightParamDTO();
                        twitterInsight.platform = "twitter";
                        twitterInsight.impressions = twitterInsight.impressions || 0;
                        twitterInsight.newFollowers = twitterInsight.newFollowers || 0;
                        twitterInsight.engagements = twitterInsight.engagements || 0;
                        twitterInsight.social_media_account_id = twitterInsight.social_media_account_id;
                        insights.push(twitterInsight);
                    }
                } catch (error) {
                    console.log("page-insight inside fetchData error:: ", error);
                }
            }
            return insights;
        } catch (error1) {
            console.log("page-insight fetchData error:: ", error1);
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

    private isNewDay(): boolean {
        const now = new Date();
        const currentHour = now.getHours();
        return currentHour === 0;
    }

    private async createDataForNewDay(data: any): Promise<void> {
        const socialMediaData = new SocialMediaInsightParamDTO();
        socialMediaData.platform = data.platform;
        socialMediaData.impressions = data.impressions;
        socialMediaData.newFollowers = data.newFollowers;
        socialMediaData.engagements = data.engagements;
        socialMediaData.social_media_account_id = data.social_media_account_id;
        await this.socialMediaService.create(socialMediaData);
    }
}
