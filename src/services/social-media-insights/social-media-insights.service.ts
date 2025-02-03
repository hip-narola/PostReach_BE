import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SocialMediaInsightParamDTO } from 'src/dtos/params/social-media-insights-param.dto';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { SocialMediaInsight } from 'src/entities/social-media-insights.entity';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';
import { SocialMediaInsightsRepository } from 'src/repositories/social-media-insights-repository';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { DashboardInsightsService } from '../dashboard-insights/dashboard-insights.service';
import { POST_TASK_STATUS } from 'src/shared/constants/post-task-status-constants';
import { SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';


@Injectable()
export class SocialMediaInsightsService {

    constructor(private readonly unitOfWork: UnitOfWork, private readonly dashboardInsightsService: DashboardInsightsService) { }

    async create(createStudentDto: SocialMediaInsightParamDTO): Promise<any> {

        await this.unitOfWork.startTransaction();
        try {
            const socialMediaInsightsData = plainToInstance(SocialMediaInsight, createStudentDto);
            const socialMediaAccountRepository = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, false);
            const socialMediaAccount = await socialMediaAccountRepository.findOne(createStudentDto.social_media_account_id);
            socialMediaInsightsData.socialMediaAccount = socialMediaAccount;
            const socialMediaInsightsRepo = this.unitOfWork.getRepository(SocialMediaInsightsRepository, SocialMediaInsight, true);
            socialMediaInsightsData.updated_at = null;
            await socialMediaInsightsRepo.create(socialMediaInsightsData);
            await this.unitOfWork.completeTransaction();
        } catch (error) {
            await this.unitOfWork.rollbackTransaction();
            throw error;
        }
    }

    async update(id: number, updateStudentDto: SocialMediaInsightParamDTO): Promise<any> {
        await this.unitOfWork.startTransaction();
        try {
            const socialMediaInsightsRepo = this.unitOfWork.getRepository(SocialMediaInsightsRepository, SocialMediaInsight, true);
            const record = await socialMediaInsightsRepo.findOne(id)
            const socialMediaAccountRepository = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, false);
            const socialMediaAccount = await socialMediaAccountRepository.findOne(updateStudentDto.social_media_account_id);
            record.socialMediaAccount = socialMediaAccount;
            record.engagements = updateStudentDto.engagements;
            record.impressions = updateStudentDto.impressions;
            record.newFollowers = updateStudentDto.newFollowers;
            record.updated_at = new Date();
            await socialMediaInsightsRepo.update(id, record);
            await this.unitOfWork.completeTransaction();
        } catch (error) {
            await this.unitOfWork.rollbackTransaction();
            throw error;
        }
    }

    async findEntryByDate(date: Date, social_media_account_id: number): Promise<any> {
        const socialMediaInsightsRepo = this.unitOfWork.getRepository(
            SocialMediaInsightsRepository,
            SocialMediaInsight,
            false
        );

        const socialMediaInsightsEntry = await socialMediaInsightsRepo.findEntryByDate(date, social_media_account_id);
        return socialMediaInsightsEntry;
    }

    async getSocialinsightsList(GetSocilInsightsParamDto: { days: number, userId: number; platform: number | null; }): Promise<any> {

        const platformName = GetSocilInsightsParamDto.platform ? SocialMediaPlatformNames[GetSocilInsightsParamDto.platform] : null;

        const socialInsightsRepository = this.unitOfWork.getRepository(SocialMediaInsightsRepository, SocialMediaInsight, false);
        const socialMediaInsightsData = await socialInsightsRepository.getSocialinsightsList(GetSocilInsightsParamDto);

        console.log("platform :", GetSocilInsightsParamDto.platform , platformName);
        
        const totalPostList = await this.dashboardInsightsService.getTotalPostList(GetSocilInsightsParamDto.userId, platformName, []);
        const approvedPostList = await this.dashboardInsightsService.getTotalPostList(GetSocilInsightsParamDto.userId, platformName, [POST_TASK_STATUS.EXECUTE_SUCCESS, POST_TASK_STATUS.SCHEDULED]);
        const rejectedPostList = await this.dashboardInsightsService.getTotalPostList(GetSocilInsightsParamDto.userId, platformName, [POST_TASK_STATUS.REJECTED]);

        const result = {
            "Posts": {
                "TotalPost": totalPostList,
                "ApprovedPost": approvedPostList,
                "RejectedPost": rejectedPostList
            },
            "Impression": {
                "Count": socialMediaInsightsData.Impression.Count,
                "Percentage": socialMediaInsightsData.Impression.PercentageChange,
                "Chart": Object.entries(socialMediaInsightsData.Impression.Chart).map(([day, data]) => ({
                    day: data.day,
                    value: data.value
                }))
            },
            "Followers": {
                "Count": socialMediaInsightsData.Followers.Count,
                "Percentage": socialMediaInsightsData.Followers.PercentageChange,
                "Chart": Object.entries(socialMediaInsightsData.Followers.Chart).map(([day, data]) => ({
                    day: data.day,
                    value: data.value
                }))
            },
            "Engagements": {
                "Count": socialMediaInsightsData.Engagements.Count,
                "Percentage": socialMediaInsightsData.Engagements.PercentageChange,
                "Chart": Object.entries(socialMediaInsightsData.Engagements.Chart).map(([day, data]) => ({
                    day: data.day,
                    value: data.value
                }))
            },
        };
        return result;
    }

    async getActiveSocialMediaAccountAsync(platform: string | null = null): Promise<SocialMediaAccount[]> {
        const socialAccountRepository = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, false);
        return socialAccountRepository.getActiveSocialMediaAccountAsync(platform);
    }

    async userAccountInsight(socia_media_account_id: number): Promise<SocialMediaInsight> {
        const socialMediaInsightsRepo = this.unitOfWork.getRepository(SocialMediaInsightsRepository, SocialMediaInsight, false);
        return await socialMediaInsightsRepo.userAccountInsight(socia_media_account_id);
    }
}
