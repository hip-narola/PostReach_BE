import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { PostTask } from 'src/entities/post-task.entity';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { DashboardInsightsRepository } from 'src/repositories/dashboard-insights-repository';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import axios from 'axios';
import { SocialMediaInsightParamDTO } from 'src/dtos/params/social-media-insights-param.dto';
import { LINKEDIN_CONST } from 'src/shared/constants/linkedin-constant';
import { PageInsightsDTO } from 'src/dtos/response/page-insights.dto';
import { PostRepository } from 'src/repositories/post-repository';
import { Post } from 'src/entities/post.entity';
import { TWITTER_CONST } from 'src/shared/constants/twitter-constant';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';
import { Throttle } from '@nestjs/throttler';
import { SocialTokenDataDTO } from 'src/dtos/params/social-token-data-dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DashboardInsightsService {

    constructor(
        private readonly unitOfWork: UnitOfWork,
        private readonly httpService: HttpService
    ) { }

    // services for facebook count
    async getTotalPostList(userID: number, platform: string | null = null, statuses: string[]): Promise<number> {
        const postHistoryRepository = this.unitOfWork.getRepository(DashboardInsightsRepository, PostTask, false);
        const data = await postHistoryRepository.getTotalPostList(userID, platform, statuses);
        return data;
    }
    

    // facebook insights
    async getFacebookInsights(socialTokenDataDTO: SocialTokenDataDTO): Promise<SocialMediaInsightParamDTO> {
        try {

            // Fetch insights for  account
            const insightsData = await this.fetchPageInsights(socialTokenDataDTO.page_id, socialTokenDataDTO.encrypted_access_token);

            const data = plainToInstance(SocialMediaAccount, socialTokenDataDTO);
            const result: SocialMediaInsightParamDTO = {
                platform: socialTokenDataDTO.platform,
                impressions: insightsData.impressions,
                newFollowers: insightsData.followers,
                engagements: insightsData.engagements,
                social_media_account_id: data.id, // First account's ID
            };

            // Return aggregated results along with individual account insights
            return result;
        }
        catch (error) {
            throw error;
        }
    }

    private async fetchPageInsights(pageId: string, accessToken: string): Promise<PageInsightsDTO> {
        try {
            const metricsUrl = `https://graph.facebook.com/v15.0/${pageId}/insights?metric=page_impressions_unique,page_post_engagements,page_fan_adds&access_token=${accessToken}`;
            const { data } = await firstValueFrom(this.httpService.get(metricsUrl));

            const insights = data.data.reduce((result: any, metric: any) => {
                const latestValue = metric.values[0]?.value || 0;
                switch (metric.name) {
                    case 'page_impressions_unique':
                        result.impressions = latestValue;
                        break;
                    case 'page_post_engagements':
                        result.engagements = latestValue;
                        break;
                    case 'page_fan_adds':
                        result.followers = latestValue;
                        break;
                    default:
                        break;
                }
                return result;
            }, { impressions: 0, engagements: 0, followers: 0 });
            return insights;
        } catch (error) {
            throw error;
        }
    }


    async getinstagramInsights(socia_media_account: SocialMediaAccount): Promise<SocialMediaInsightParamDTO> {

        try {
            const insightsData = await this.fetchInstagramInsights(socia_media_account.instagram_Profile, socia_media_account.encrypted_access_token);
            // Return aggregated results along with individual account insights
            const result: SocialMediaInsightParamDTO = {
                platform: socia_media_account.platform,
                impressions: insightsData.impressions,
                newFollowers: insightsData.newFollowers,
                engagements: insightsData.engagements,
                social_media_account_id: socia_media_account.id, // First account's ID
            };

            return result;
        }
        catch (error) {
            throw error;
        }
    }

    // instagram insights

    async fetchInstagramInsights(instagramUserId: string, accessToken: string) {

        const baseUrl = `https://graph.facebook.com/v15.0/${instagramUserId}/insights`;
        const metrics = {
            impressions: 0,
            engagements: 0,
            newFollowers: 0,
        };

        try {
            // Step 1: Fetch Impressions
            const impressionsResponse = await axios.get(baseUrl, {
                params: {
                    metric: 'impressions',
                    period: 'day', // Required period for impressions
                    access_token: accessToken,
                },
            });
            const impressionsData = impressionsResponse.data.data.find(
                (metric: any) => metric.name === 'impressions',
            );
            metrics.impressions = impressionsData?.values?.[0]?.value || 0;

            // Step 2: Fetch Engagements
            const engagementsResponse = await axios.get(baseUrl, {
                params: {
                    metric: 'accounts_engaged',
                    metric_type: 'total_value', // Required for engagements
                    period: 'day', // Required period for accounts_engaged
                    access_token: accessToken,
                },
            });
            const engagementsData = engagementsResponse.data.data.find(
                (metric: any) => metric.name === 'accounts_engaged',
            );
            metrics.engagements = engagementsData?.values?.[0]?.value || 0;

            //   Step 3: Fetch New Followers
            const followersResponse = await axios.get(baseUrl, {
                params: {
                    metric: 'follower_count',
                    period: 'day', // Required period for follower_count
                    access_token: accessToken,
                },
            });
            const followerData = followersResponse.data.data.find(
                (metric: any) => metric.name === 'follower_count',
            );

            if (followerData && followerData.values.length > 1) {
                const [previousCount, currentCount] = followerData.values.map(
                    (value: any) => value.value || 0,
                );
                metrics.newFollowers = currentCount - previousCount;
            } else if (followerData) {
                metrics.newFollowers = followerData.values?.[0]?.value || 0;
            }

            return metrics;
        } catch (error) {
            throw new Error(`Error fetching Instagram insights: ${error.message}`);
        }
    }

    async gelinkedInInsights(socialMediaAccount: SocialTokenDataDTO): Promise<SocialMediaInsightParamDTO> {
        try {

            const data = plainToInstance(SocialMediaAccount, socialMediaAccount);

            if (socialMediaAccount.page_id) {
                const followersCount = await this.fetchLinkedinOrganizationFollowers(socialMediaAccount.page_id, socialMediaAccount.encrypted_access_token);
                const insightsData = await this.fetchLinkedInPageInsights(socialMediaAccount.page_id, socialMediaAccount.encrypted_access_token);

                const result: SocialMediaInsightParamDTO = {
                    platform: socialMediaAccount.platform,
                    impressions: insightsData[0]?.totalShareStatistics?.impressionCount || 0,
                    newFollowers: followersCount || 0,
                    engagements: insightsData[0]?.totalShareStatistics?.engagement || 1,
                    social_media_account_id: data.id
                };
                return result;
            }
            else {
                const result = await this.fetchUserInsights(data.id, socialMediaAccount.encrypted_access_token);
                return result;
            }
        }
        catch (error) {
            throw new Error(`Error fetching LinkedIn insight: ${error}`);
        }
    }

    @Throttle({ default: { limit: 100, ttl: 86400000 } })
    async fetchLinkedInPageInsights(organizationId: string, linkedinAccessToken: string) {
        try {
            // Fetch page statistics for the LinkedIn organization
            const pageStatsResponse = await axios.get(
                `${LINKEDIN_CONST.ENDPOINT}/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn%3Ali%3Aorganization%3A${organizationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${linkedinAccessToken}`,
                        'X-Restli-Protocol-Version': '2.0.0', // Ensure this version is supported by LinkedIn
                        'LinkedIn-Version': '202411' // Update as necessary with LinkedIn API version
                    },
                }
            );

            // Validate and extract metrics
            const statsData = pageStatsResponse.data?.elements || [];
            if (!statsData.length) {
                throw new Error('No statistics data found for the specified organization.');
            }
            return statsData;

        } catch (error: any) {
            // Provide a meaningful error message
            throw new Error(
                `Failed to fetch LinkedIn insights: ${error.response?.data?.message || error.message}`
            );
        }
    }

    @Throttle({ default: { limit: 100, ttl: 86400000 } })
    async fetchLinkedinOrganizationFollowers(organizationId: string, linkedinAccessToken: string) {
        try {
            const followersResponse = await axios.get(`${LINKEDIN_CONST.ENDPOINT}/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn%3Ali%3Aorganization%3A${organizationId}`, {
                headers: {
                    Authorization: `Bearer ${linkedinAccessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            });

            // Extract elements from the response
            const elements = followersResponse.data.elements;

            // Initialize total followers count
            let totalFollowerCount = 0;

            // Sum followers for each category
            elements.forEach(element => {
                const categories = [
                    'followerCountsByFunction',
                    'followerCountsByStaffCountRange',
                    'followerCountsBySeniority',
                    'followerCountsByIndustry',
                ];

                categories.forEach(category => {
                    if (element[category]) {
                        totalFollowerCount += element[category].reduce((acc, item) => {
                            const organicCount = item.followerCounts.organicFollowerCount || 0;
                            const paidCount = item.followerCounts.paidFollowerCount || 0;
                            return acc + organicCount + paidCount;
                        }, 0);
                    }
                });
            });

            return totalFollowerCount;
        } catch (error) {
            throw new Error(`Failed to fetch organization followers: ${error.response?.data || error.message}`);
        }
    }

    // async fetchUserInsights(userId: string, linkedinAccessToken: string) {
    //     const postRepository = this.unitOfWork.getRepository(PostRepository, Post, true);
    //     try {
    //         // Step 1: Fetch user posts (fixing the query parameters)
    //         // // https://api.linkedin.com/v2/shares
    //         // const postsResponse = await axios.get(`${LINKEDIN_CONST.ENDPOINT}/ugcPosts`, {
    //         //     headers: {
    //         //         Authorization: `Bearer ${linkedinAccessToken}`,
    //         //         'X-Restli-Protocol-Version': '2.0.0'
    //         //     },
    //         //     params: {
    //         //         q: 'authors',
    //         //         authors: `List(urn:li:person:${userId})`
    //         //     }
    //         // });

    //         const posts = await postRepository.fetchLinkedInPosts();

    //         // Array to hold the insights for all posts
    //         const insightsData = [];

    //         // Step 2: Fetch insights for each post
    //         for (const post of posts) {
    //             const postId = post.id;

    //             // Fetch insights for the specific post
    //             const insightsResponse = await axios.get(`${LINKEDIN_CONST.ENDPOINT}/socialActions/${postId}/insights`, {
    //                 headers: {
    //                     Authorization: `Bearer ${linkedinAccessToken}`,
    //                     'X-Restli-Protocol-Version': '2.0.0'
    //                 }
    //             });
    //             // Step 3: Extract insights data (engagements, followers, impressions)
    //             const postInsights = {
    //                 postId: postId,
    //                 engagements: insightsResponse.data.elements[0].engagements,
    //                 followers: insightsResponse.data.elements[0].followers,
    //                 impressions: insightsResponse.data.elements[0].impressions,
    //             };

    //             insightsData.push(postInsights);
    //         }

    //         // Step 4: Aggregate the insights data
    //         const aggregatedInsights = insightsData.reduce((acc, post) => {
    //             acc.totalEngagements += post.engagements || 0;
    //             acc.totalFollowers += post.followers || 0;
    //             acc.totalImpressions += post.impressions || 0;
    //             return acc;
    //         }, { totalEngagements: 0, totalFollowers: 0, totalImpressions: 0 });
    //         return aggregatedInsights;
    //     } catch (error) {
    //         throw new Error('Failed to fetch LinkedIn insights for user');
    //     }
    // }

    @Throttle({ default: { limit: 100, ttl: 86400000 } })
    async fetchUserInsights(socialMediaAccountId: number, linkedinAccessToken: string): Promise<SocialMediaInsightParamDTO> {
        const url = `${LINKEDIN_CONST.ENDPOINT}/organizationAcls?q=roleAssignee`;

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${linkedinAccessToken}`,
                },
            });

            const organizations = response.data.elements || [];

            if (organizations.length === 0) {
                throw new Error('Failed to fetch LinkedIn insights for user: user does not have organizations');
            }

            let totalImpressions = 0;
            let totalNewFollowers = 0;
            let totalEngagements = 0;

            for (const org of organizations) {
                const ExtractOrganizationId = org.organization.match(/urn:li:organization:(\d+)/);
                const organizationId = ExtractOrganizationId ? ExtractOrganizationId[1] : '';

                if (!organizationId) {
                    continue; // Skip if no organizationId is found
                }

                // Fetch followers count
                const followersCount = await this.fetchLinkedinOrganizationFollowers(organizationId, linkedinAccessToken);

                // Fetch page insights
                const insightsData = await this.fetchLinkedInPageInsights(organizationId, linkedinAccessToken);

                // Aggregate the results
                totalImpressions += insightsData[0]?.totalShareStatistics?.impressionCount || 0;
                totalNewFollowers += followersCount || 0;
                totalEngagements += insightsData[0]?.totalShareStatistics?.engagement || 0;
            }

            const resultItem: SocialMediaInsightParamDTO = {
                platform: SocialMediaPlatformNames[SocialMediaPlatform['LINKEDIN']],
                impressions: totalImpressions,
                newFollowers: totalNewFollowers,
                engagements: totalEngagements,
                social_media_account_id: socialMediaAccountId,
            };
            return resultItem;

        } catch (error) {
            throw new Error('Failed to fetch LinkedIn insights for user: ' + error.message);
        }
    }

    async getTwitterInsights(account: SocialTokenDataDTO): Promise<SocialMediaInsightParamDTO> {

        // Fetch insights for account
        const data = plainToInstance(SocialMediaAccount, account);
        const insightsData = await this.fetchTwitterInsights(data.id, account.encrypted_access_token);

        const result: SocialMediaInsightParamDTO = {
            platform: account.platform,
            impressions: insightsData.impressions,
            newFollowers: insightsData.newFollowers,
            engagements: insightsData.engagements,
            social_media_account_id: data.id, // First account's ID
        };
        return result;
    }

    @Throttle({ default: { limit: 25, ttl: 86400000 } })
    async fetchTwitterfollowersMetrics(bearerToken: string): Promise<number> {
        try {
            const url = `${TWITTER_CONST.ENDPOINT}/users/me?user.fields=public_metrics`;
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                },
            });

            if (response.status === 200) {
                if (response.data?.data?.public_metrics) {
                    const metrics = response.data.data.public_metrics;
                    return metrics.followers_count;
                }
            }
        } catch (error) {
            throw new Error(`Error fetching Twitter data: ${error.response?.data || error.message}`);
        }
    }

    @Throttle({ default: { limit: 25, ttl: 86400000 } })
    async fetchTweetMetrics(tweetId: string, accessToken: string): Promise<PageInsightsDTO> {
        try {
            const response = await axios.get(`${TWITTER_CONST.ENDPOINT}/tweets/${tweetId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    'tweet.fields': 'public_metrics,created_at',
                },
            });

            const metrics = response.data.data.public_metrics;

            const result: PageInsightsDTO = {
                impressions: metrics.impression_count || 0,
                followers: 0,
                engagements: metrics.like_count + metrics.retweet_count + metrics.reply_count + metrics.quote_count || 0,
            };
            return result;
            // return {
            //     impressions: metrics.impression_count || 0,
            //     engagements: metrics.like_count + metrics.retweet_count + metrics.reply_count + metrics.quote_count || 0,
            // };

        } catch (error) {
            throw new Error(`Failed to fetch tweet metrics: ${error.response?.data || error.message}`);
        }
    }

    private async fetchTwitterInsights(socialMediaAccountId: number, accessToken: string): Promise<SocialMediaInsightParamDTO> {
        try {
            const postRepository = this.unitOfWork.getRepository(PostRepository, Post, false);

            // const allTweet = await this.getUserTweets(userId, accessToken);
            const allTweet = await postRepository.fetchTwitterPosts();

            const followerCount = await this.fetchTwitterfollowersMetrics(accessToken);
            let totalImpressions = 0;
            let totalEngagements = 0;
            if (allTweet) {
                // Step 2: Fetch Metrics for Each Tweet and Aggregate
                for (const tweet of allTweet) {
                    const tweetId = tweet.external_platform_id;
                    const insightsData = await this.fetchTweetMetrics(tweetId, accessToken);
                    totalImpressions += insightsData.impressions || 0;
                    totalEngagements += insightsData.engagements || 0;
                }
            }
            // const metrics1 = await this.fetchTweetMetrics(userId, accessToken);
            // const metrics2 = await this.fetchUserTweetsWithMetrics(userId, accessToken);

            const resultItem: SocialMediaInsightParamDTO = {
                platform: SocialMediaPlatformNames[SocialMediaPlatform['TWITTER']],
                impressions: totalImpressions,
                newFollowers: followerCount,
                engagements: totalEngagements,
                social_media_account_id: socialMediaAccountId,
            };
            return resultItem;

            // return { metrics, metrics1 };
        } catch (error) {
            throw new Error(`Error fetching Twitter user statssadas sadasd: ${error.message}`);
        }
    }

    //get all tweets of user from twitter
    private async getUserTweets(userId, accessToken) {
        try {
            const response = await axios.get(`${TWITTER_CONST.ENDPOINT}/users/${userId}/tweets`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    max_results: 100, // Maximum number of tweets per request (default: 10, max: 100)
                },
            });
            return response.data.data;

        } catch (error) {
            throw error;
        }
    }
}
