
import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SocialMediaInsight } from 'src/entities/social-media-insights.entity';
import { SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';

@Injectable()
export class SocialMediaInsightsRepository extends GenericRepository<SocialMediaInsight> {

    constructor(
        @InjectRepository(SocialMediaInsight)
        repository: Repository<SocialMediaInsight>) {
        super(repository);
    }

    async findEntryByDate(date: Date, social_media_account_id: number): Promise<any> {

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const entry = this.repository.findOne({
            where: {
                created_at: Between(startOfDay, endOfDay),
                socialMediaAccount: { id: social_media_account_id },
            },
        });

        return entry;
    }

    async getSocialinsightsList(GetSocilInsightsParamDto: { days: number, userId: number; platform: number | null; }) {

        const { days, userId, platform } = GetSocilInsightsParamDto;

        const platformName = platform ? SocialMediaPlatformNames[platform] : null;
        // Calculate the date for the 'days' parameter
        const dateCondition = new Date();
        dateCondition.setDate(dateCondition.getDate() - days); // Subtract days from the current date

        // Format the date to YYYY-MM-DD (ignore time)
        const formattedDate = dateCondition.toISOString().split('T')[0]; // 'YYYY-MM-DD'

        // Initialize the query builder
        const queryBuilder = this.repository.createQueryBuilder('insight')
            .innerJoin('insight.socialMediaAccount', 'account')
            .where('account.user_id = :userId', { userId })
            .andWhere('DATE(insight.created_at) >= :dateCondition', { dateCondition: formattedDate }) // Use DATE() to ignore time
            .orderBy('insight.created_at', 'DESC'); // Sorting insights by creation date

        // Add platform filter if it's provided
        if (platform) {
            queryBuilder.andWhere('account.platform = :platformName', { platformName });
        }

        // Execute the query and fetch the results
        const socialInsights = await queryBuilder.getMany();

        // Function to get the day of the week from the date
        const getDayName = (date: string) => {
            const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const dateObj = new Date(date);
            return daysOfWeek[dateObj.getDay()];
        };

        const impressionsData = {};
        const followersData = {};
        const engagementsData = {};

        let totalImpressions = 0;
        let totalFollowers = 0;
        let totalEngagements = '0';

        socialInsights.forEach(insight => {
            const date = insight.created_at.toISOString().split('T')[0]; // Get the date only
            const dayOfWeek = getDayName(date); // Get the day name (e.g., "Sunday", "Monday")

            if (!impressionsData[dayOfWeek]) {
                impressionsData[dayOfWeek] = 0;
                followersData[dayOfWeek] = 0;
                engagementsData[dayOfWeek] = 0;
            }

            impressionsData[dayOfWeek] += insight.impressions;
            followersData[dayOfWeek] += insight.newFollowers;
            engagementsData[dayOfWeek] = (parseFloat(engagementsData[dayOfWeek] || '0') + parseFloat(insight.engagements)).toFixed(2);

            totalImpressions += insight.impressions;
            totalFollowers += insight.newFollowers;
            totalEngagements = (parseFloat(totalEngagements || '0') + parseFloat(insight.engagements || '0')).toFixed(2);
        });

        // Current period condition
        const currentDateCondition = new Date();
        currentDateCondition.setDate(currentDateCondition.getDate() - days);
        const formattedCurrentDate = currentDateCondition.toISOString().split('T')[0];

        // Previous period condition
        const previousDateCondition = new Date();
        previousDateCondition.setDate(previousDateCondition.getDate() - 2 * days);
        const formattedPreviousDate = previousDateCondition.toISOString().split('T')[0];

        // Fetch data for the current period
        const queryBuilderCurrent = this.repository.createQueryBuilder('insight')
            .innerJoin('insight.socialMediaAccount', 'account')
            .where('account.user_id = :userId', { userId })
            .andWhere('DATE(insight.created_at) >= :dateCondition', { dateCondition: formattedCurrentDate })
            .orderBy('insight.created_at', 'DESC');
        if (platform) {
            queryBuilderCurrent.andWhere('account.platform = :platformName', { platformName });
        }
        const currentSocialInsights = await queryBuilderCurrent.getMany();

        // Fetch data for the previous period
        const queryBuilderPrevious = this.repository.createQueryBuilder('insight')
            .innerJoin('insight.socialMediaAccount', 'account')
            .where('account.user_id = :userId', { userId })
            .andWhere('DATE(insight.created_at) >= :dateCondition', { dateCondition: formattedPreviousDate })
            .andWhere('DATE(insight.created_at) < :currentStartDate', { currentStartDate: formattedCurrentDate })
            .orderBy('insight.created_at', 'DESC');
        if (platform) {
            queryBuilderPrevious.andWhere('account.platform = :platformName', { platformName });
        }
        const previousSocialInsights = await queryBuilderPrevious.getMany();
        // Aggregate data for current and previous periods
        const aggregateData = (insights) => {
            return insights.reduce((acc, insight) => {
                acc.totalImpressions += insight.impressions;
                acc.totalFollowers += insight.newFollowers;
                acc.totalEngagements += insight.engagements;
                return acc;
            }, { totalImpressions: 0, totalFollowers: 0, totalEngagements: 0 });
        };

        const currentData = aggregateData(currentSocialInsights);
        const previousData = aggregateData(previousSocialInsights);

        // Calculate percentage change
        const calculatePercentageChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0; // Avoid division by zero
            return ((current - previous) / previous) * 100;
        };

        const percentageChanges = {
            impressions: calculatePercentageChange(currentData.totalImpressions, previousData.totalImpressions),
            followers: calculatePercentageChange(currentData.totalFollowers, previousData.totalFollowers),
            engagements: calculatePercentageChange(currentData.totalEngagements, previousData.totalEngagements)
        };

        // Prepare the response in the required JSON format
        const result = {
            "Impression": {
                "Count": totalImpressions,
                "PercentageChange": percentageChanges.impressions,
                "Chart": Object.keys(impressionsData).map(day => ({
                    day: day, // Now day is the actual name of the day like "Monday"
                    value: impressionsData[day]
                }))
            },
            "Followers": {
                "Count": totalFollowers,
                "PercentageChange": percentageChanges.followers,
                "Chart": Object.keys(followersData).map(day => ({
                    day: day, // Same here for followers
                    value: followersData[day]
                }))
            },
            "Engagements": {
                "Count": totalEngagements,
                "PercentageChange": percentageChanges.engagements,
                "Chart": Object.keys(engagementsData).map(day => ({
                    day: day, // Same here for engagements
                    value: engagementsData[day]
                }))
            }
        };

        return result;
    }

    async userAccountInsight(socia_media_account_id: number): Promise<SocialMediaInsight> {
        const currentDate = new Date().toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'

        return this.repository.createQueryBuilder('insight')
            .where('DATE(insight.created_at) = :createdAt', { createdAt: currentDate })
            .andWhere('insight.socia_media_account_id = :socia_media_account_id', { socia_media_account_id })
            .getOne();
    }
}