import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SocialMediaInsightParamDTO } from 'src/dtos/params/social-media-insights-param.dto';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { SocialMediaInsight } from 'src/entities/social-media-insights.entity';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';
import { SocialMediaInsightsRepository } from 'src/repositories/social-media-insights-repository';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { DashboardInsightsService } from '../dashboard-insights/dashboard-insights.service';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';


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

        const { platform } = GetSocilInsightsParamDto;

        const platformName = platform ? SocialMediaPlatformNames[platform] : null;

        const socialInsightsRepository = this.unitOfWork.getRepository(SocialMediaInsightsRepository, SocialMediaInsight, false);
        const socialMediaInsightsData = await socialInsightsRepository.getSocialinsightsList(GetSocilInsightsParamDto);

        let totalPostList = 0;
        let approvedPostList = 0;
        let rejectedPostList = 0;

        if (platformName == SocialMediaPlatformNames[SocialMediaPlatform['FACEBOOK']]) {
            totalPostList = await this.dashboardInsightsService.getTotalFacebookPostList(GetSocilInsightsParamDto.userId);
            approvedPostList = await this.dashboardInsightsService.getTotalFacebookApprovedPostList(GetSocilInsightsParamDto.userId);
            rejectedPostList = await this.dashboardInsightsService.getTotalFacebookRejectedPostList(GetSocilInsightsParamDto.userId);
        }
        else if (platformName == SocialMediaPlatformNames[SocialMediaPlatform['INSTAGRAM']]) {
            totalPostList = await this.dashboardInsightsService.getTotalInstagramPostList(GetSocilInsightsParamDto.userId);
            approvedPostList = await this.dashboardInsightsService.getTotalInstagramApprovedPostList(GetSocilInsightsParamDto.userId);
            rejectedPostList = await this.dashboardInsightsService.getTotalInstagramRejectedPostList(GetSocilInsightsParamDto.userId);

        }
        else if (platformName == SocialMediaPlatformNames[SocialMediaPlatform['LINKEDIN']]) {
            totalPostList = await this.dashboardInsightsService.getTotalLinkedinPostList(GetSocilInsightsParamDto.userId);
            approvedPostList = await this.dashboardInsightsService.getTotalLinkedinApprovedPostList(GetSocilInsightsParamDto.userId);
            rejectedPostList = await this.dashboardInsightsService.getTotalLinkedinRejectedPostList(GetSocilInsightsParamDto.userId);
        }
        else if (platformName == SocialMediaPlatformNames[SocialMediaPlatform['TWITTER']]) {
            totalPostList = await this.dashboardInsightsService.getTotalTwitterPostList(GetSocilInsightsParamDto.userId);
            approvedPostList = await this.dashboardInsightsService.getTotalTwitterApprovedPostList(GetSocilInsightsParamDto.userId);
            rejectedPostList = await this.dashboardInsightsService.getTotalTwitterRejectedPostList(GetSocilInsightsParamDto.userId);

        }
        else {
            const totalFacebookPostList = await this.dashboardInsightsService.getTotalFacebookPostList(GetSocilInsightsParamDto.userId);
            const approvedFacebookPostList = await this.dashboardInsightsService.getTotalFacebookApprovedPostList(GetSocilInsightsParamDto.userId);
            const rejectedFacebookPostList = await this.dashboardInsightsService.getTotalFacebookRejectedPostList(GetSocilInsightsParamDto.userId);

            const totalInstagramPostList = await this.dashboardInsightsService.getTotalInstagramPostList(GetSocilInsightsParamDto.userId);
            const approvedInstagramPostList = await this.dashboardInsightsService.getTotalInstagramApprovedPostList(GetSocilInsightsParamDto.userId);
            const rejectedInstagramPostList = await this.dashboardInsightsService.getTotalInstagramRejectedPostList(GetSocilInsightsParamDto.userId);


            const totalLinkedinPostList = await this.dashboardInsightsService.getTotalLinkedinPostList(GetSocilInsightsParamDto.userId);
            const approvedLinkedinPostList = await this.dashboardInsightsService.getTotalLinkedinApprovedPostList(GetSocilInsightsParamDto.userId);
            const rejectedLinkedinPostList = await this.dashboardInsightsService.getTotalLinkedinRejectedPostList(GetSocilInsightsParamDto.userId);

            const totaltwitterPostList = await this.dashboardInsightsService.getTotalTwitterPostList(GetSocilInsightsParamDto.userId);
            const approvedtwitterPostList = await this.dashboardInsightsService.getTotalTwitterApprovedPostList(GetSocilInsightsParamDto.userId);
            const rejectedtwitterPostList = await this.dashboardInsightsService.getTotalTwitterRejectedPostList(GetSocilInsightsParamDto.userId);

            totalPostList = totalFacebookPostList + totalInstagramPostList + totalLinkedinPostList + totaltwitterPostList;
            approvedPostList = approvedFacebookPostList + approvedInstagramPostList + approvedLinkedinPostList + approvedtwitterPostList;
            rejectedPostList = rejectedFacebookPostList + rejectedInstagramPostList + rejectedLinkedinPostList + rejectedtwitterPostList;
        }

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

    async getUniqueUserIds(): Promise<number[]> {
        const socialAccountRepository = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, false);
        return socialAccountRepository.findUniqueUserIds();
    }
}
