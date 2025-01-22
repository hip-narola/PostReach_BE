import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SocialMediaInsightsService } from '../../services/social-media-insights/social-media-insights.service';
import { SocialMediaInsightParamDTO } from 'src/dtos/params/social-media-insights-param.dto';
import { DashboardInsightsService } from '../../services/dashboard-insights/dashboard-insights.service';

@Processor('page-insight')
export class PageInsightProcessor extends WorkerHost {
    constructor(
        private readonly socialMediaService: SocialMediaInsightsService, 
        private readonly dashboardInsightsService: DashboardInsightsService
    ) {
        super();
        console.log('PageInsightProcessor instantiated'); // Debug log to ensure processor instantiation
    }

    async process(job: Job<any>): Promise<void> {
        console.log("page-insight started::", job);
        try {
            const data = await this.fetchData();
            console.log("page-insight data::", data);

            // if (this.isNewDay()) {
            //     for (const insight of data) {
            //         await this.createDataForNewDay(insight);
            //     }
            // } else {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                for (const insight of data) {
                    console.log("page-insight insight::", insight);

                    const existingEntry = await this.socialMediaService.findEntryByDate(
                        todayStart, 
                        insight.social_media_account_id
                    );
                    console.log("page-insight existingEntry::", existingEntry);

                    if (!existingEntry) {
                        await this.createDataForNewDay(insight);
                    } else {
                        await this.updateDatabase(insight, existingEntry.id);
                    }
                }
            // }
        } catch (error) {
            console.error("page-insight error::", error); // Changed to console.error for better visibility
        }
    }

    private async fetchData(): Promise<any[]> {
        console.log("page-insight fetchData started::");
        try {
            // TODO : Get active subscription users & conncted social media accounts.
            const userids = await this.socialMediaService.getUniqueUserIds();
            const insights: SocialMediaInsightParamDTO[] = [];

            for (const userID of userids) {
                console.log("page-insight fetchData userID::", userID)
                try {
                    // TODO:  change function request parameter
                    const facebookData = await this.dashboardInsightsService.getFacebookInsights(userID, 'facebook');
                    if (facebookData) {
                        insights.push(this.mapToDto(facebookData, 'facebook'));
                    }

                    const instagramData = await this.dashboardInsightsService.getinstagramInsights(userID, 'instagram');
                    if (instagramData) {
                        insights.push(this.mapToDto(instagramData, 'instagram'));
                    }

                    const linkedinData = await this.dashboardInsightsService.gelinkedInInsights(userID, 'linkedIn');
                    if (linkedinData) {
                        insights.push(this.mapToDto(linkedinData, 'linkedIn'));
                    }

                    const twitterData = await this.dashboardInsightsService.getTwitterInsights(userID, 'twitter');
                    if (twitterData) {
                        insights.push(this.mapToDto(twitterData, 'twitter'));
                    }
                } catch (error) {
                    console.error("page-insight inside fetchData error::", error); // Improved logging
                }
            }

            return insights;
        } catch (error1) {
            console.error("page-insight fetchData error::", error1); // Improved logging
            return [];
        }
    }

    private mapToDto(data: any, platform: string): SocialMediaInsightParamDTO {
        console.log("map to: data", data);
        const dto = new SocialMediaInsightParamDTO();
        dto.platform = platform;
        dto.impressions = data.impressions || 0;
        dto.newFollowers = data.newFollowers || 0;
        dto.engagements = data.engagements || 0;
        dto.social_media_account_id = data.social_media_account_id;
        console.log("map to: dto", dto);
        return dto;
    }

    private async updateDatabase(data: SocialMediaInsightParamDTO, id: number): Promise<void> {
        console.log(`Updating database entry with ID: ${id}`); // Debug log
        await this.socialMediaService.update(id, data);
    }

    private isNewDay(): boolean {
        const now = new Date();
        const currentHour = now.getHours();
        return currentHour === 0;
    }

    private async createDataForNewDay(data: SocialMediaInsightParamDTO): Promise<void> {
        console.log(`Creating new data for platform: ${data.platform}`); // Debug log
        await this.socialMediaService.create(data);
    }
}
