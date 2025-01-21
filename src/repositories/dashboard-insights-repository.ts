import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GenericRepository } from './generic-repository';
import { PostTask } from 'src/entities/post-task.entity';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';
import { POST_TASK_STATUS } from 'src/shared/constants/post-task-status-constants';
import { ASSET_TYPE } from 'src/shared/constants/asset-type-constants';

@Injectable()
export class DashboardInsightsRepository extends GenericRepository<PostTask> {
    constructor(repository: Repository<PostTask>) {
        super(repository);
    }

    // for facebook
    async getTotalFacebookPostList(userId: number): Promise<any> {
        try {

            const postTasks = await this.repository.createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'p.id AS post_id',
                    'a.url AS image',
                    'p.content AS content',
                    'sm.platform AS socialimage',
                    'pt.scheduled_at AS schedule_date',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                    'p.hashtags AS hashtags',
                    'ur.name AS user',
                    'ur.profilePicture AS profileimage',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .andWhere('pt.user_id = :userid', { userid: userId })
                .andWhere('sm.platform = :platform', { platform: SocialMediaPlatformNames[SocialMediaPlatform['FACEBOOK']] })
                .getRawMany();


            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.content,
                channel: queryResult.socialimage,
                scheduled_at: queryResult.schedule_date,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views }
                ]
            }));

            return data.length;
        }
        catch (error) {
            throw error;
        }

    }


    async getTotalFacebookApprovedPostList(userId: number): Promise<any> {
        try {

            const postTasks = await this.repository.createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'p.id AS post_id',
                    'a.url AS image',
                    'p.content AS content',
                    'sm.platform AS socialimage',
                    'pt.scheduled_at AS schedule_date',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                    'p.hashtags AS hashtags',
                    'ur.name AS user',
                    'ur.profilePicture AS profileimage',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .andWhere('pt.user_id = :userid', { userid: userId })
                .andWhere('pt.status IN (:...statuses)', { statuses: [POST_TASK_STATUS.EXECUTE_SUCCESS, POST_TASK_STATUS.SCHEDULED] })
                .andWhere('sm.platform = :platform', { platform: SocialMediaPlatformNames[SocialMediaPlatform['FACEBOOK']] })
                .getRawMany();


            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.content,
                channel: queryResult.socialimage,
                scheduled_at: queryResult.schedule_date,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views }
                ]
            }));

            return data.length;
        }
        catch (error) {
            throw error;
        }

    }


    async getTotalFacebookRejectedPostList(userId: number): Promise<any> {
        try {

            const postTasks = await this.repository.createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'p.id AS post_id',
                    'a.url AS image',
                    'p.content AS content',
                    'sm.platform AS socialimage',
                    'pt.scheduled_at AS schedule_date',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                    'p.hashtags AS hashtags',
                    'ur.name AS user',
                    'ur.profilePicture AS profileimage',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .andWhere('pt.user_id = :userid', { userid: userId })
                .andWhere('pt.status = :status', { status: POST_TASK_STATUS.REJECTED })
                .andWhere('sm.platform = :platform', { platform: SocialMediaPlatformNames[SocialMediaPlatform['FACEBOOK']] })
                .getRawMany();


            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.content,
                channel: queryResult.socialimage,
                scheduled_at: queryResult.schedule_date,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views }
                ]
            }));

            return data.length;
        }
        catch (error) {
            throw error;
        }

    }

    //for linkedin

    async getTotalLinkedinPostList(userId: number): Promise<any> {
        try {

            const postTasks = await this.repository.createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'p.id AS post_id',
                    'a.url AS image',
                    'p.content AS content',
                    'sm.platform AS socialimage',
                    'pt.scheduled_at AS schedule_date',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                    'p.hashtags AS hashtags',
                    'ur.name AS user',
                    'ur.profilePicture AS profileimage',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type:ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .andWhere('pt.user_id = :userid', { userid: userId })
                .andWhere('sm.platform = :platform', { platform: SocialMediaPlatformNames[SocialMediaPlatform['LINKEDIN']] })
                .getRawMany();


            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.content,
                channel: queryResult.socialimage,
                scheduled_at: queryResult.schedule_date,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views }
                ]
            }));

            return data.length;
        }
        catch (error) {
            throw error;
        }

    }

    async getTotalLinkedinApprovedPostList(userId: number): Promise<any> {
        try {

            const postTasks = await this.repository.createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'p.id AS post_id',
                    'a.url AS image',
                    'p.content AS content',
                    'sm.platform AS socialimage',
                    'pt.scheduled_at AS schedule_date',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                    'p.hashtags AS hashtags',
                    'ur.name AS user',
                    'ur.profilePicture AS profileimage',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .andWhere('pt.user_id = :userid', { userid: userId })
                .andWhere('pt.status IN (:...statuses)', { statuses: [POST_TASK_STATUS.EXECUTE_SUCCESS, POST_TASK_STATUS.SCHEDULED] })
                .andWhere('sm.platform = :platform', { platform: SocialMediaPlatformNames[SocialMediaPlatform['LINKEDIN']] })
                .getRawMany();


            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.content,
                channel: queryResult.socialimage,
                scheduled_at: queryResult.schedule_date,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views }
                ]
            }));

            return data.length;
        }
        catch (error) {
            throw error;
        }

    }

    async getTotalLinkedinRejectedPostList(userId: number): Promise<any> {
        try {

            const postTasks = await this.repository.createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'p.id AS post_id',
                    'a.url AS image',
                    'p.content AS content',
                    'sm.platform AS socialimage',
                    'pt.scheduled_at AS schedule_date',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                    'p.hashtags AS hashtags',
                    'ur.name AS user',
                    'ur.profilePicture AS profileimage',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .andWhere('pt.user_id = :userid', { userid: userId })
                .andWhere('pt.status = :status', { status: POST_TASK_STATUS.REJECTED })
                .andWhere('sm.platform = :platform', { platform: SocialMediaPlatformNames[SocialMediaPlatform['LINKEDIN']] })
                .getRawMany();


            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.content,
                channel: queryResult.socialimage,
                scheduled_at: queryResult.schedule_date,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views }
                ]
            }));

            return data.length;
        }
        catch (error) {
            throw error;
        }

    }


    // for twitter
    async getTotalTwitterPostList(userId: number): Promise<any> {
        try {

            const postTasks = await this.repository.createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'p.id AS post_id',
                    'a.url AS image',
                    'p.content AS content',
                    'sm.platform AS socialimage',
                    'pt.scheduled_at AS schedule_date',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                    'p.hashtags AS hashtags',
                    'ur.name AS user',
                    'ur.profilePicture AS profileimage',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .andWhere('pt.user_id = :userid', { userid: userId })
                .andWhere('sm.platform = :platform', { platform: SocialMediaPlatformNames[SocialMediaPlatform['TWITTER']] })
                .getRawMany();


            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.content,
                channel: queryResult.socialimage,
                scheduled_at: queryResult.schedule_date,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views }
                ]
            }));

            return data.length;
        }
        catch (error) {
            throw error;
        }

    }

    async getTotalTwitterApprovedPostList(userId: number): Promise<any> {
        try {

            const postTasks = await this.repository.createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'p.id AS post_id',
                    'a.url AS image',
                    'p.content AS content',
                    'sm.platform AS socialimage',
                    'pt.scheduled_at AS schedule_date',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                    'p.hashtags AS hashtags',
                    'ur.name AS user',
                    'ur.profilePicture AS profileimage',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .andWhere('pt.user_id = :userid', { userid: userId })
                .andWhere('pt.status IN (:...statuses)', { statuses: [POST_TASK_STATUS.EXECUTE_SUCCESS, POST_TASK_STATUS.SCHEDULED] })
                .andWhere('sm.platform = :platform', { platform: SocialMediaPlatformNames[SocialMediaPlatform['TWITTER']] })
                .getRawMany();


            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.content,
                channel: queryResult.socialimage,
                scheduled_at: queryResult.schedule_date,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views }
                ]
            }));

            return data.length;
        }
        catch (error) {
            throw error;
        }

    }

    async getTotalTwitterRejectedPostList(userId: number): Promise<any> {
        try {
            const postTasks = await this.repository.createQueryBuilder('pt')
                .select([
                    'DISTINCT pt.id AS post_task_id',
                    'p.id AS post_id',
                    'a.url AS image',
                    'p.content AS content',
                    'sm.platform AS socialimage',
                    'pt.scheduled_at AS schedule_date',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                    'p.hashtags AS hashtags',
                    'ur.name AS user',
                    'ur.profilePicture AS profileimage',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .andWhere('pt.user_id = :userid', { userid: userId })
                .andWhere('pt.status = :status', { status: POST_TASK_STATUS.REJECTED })
                .andWhere('sm.platform = :platform', { platform: SocialMediaPlatformNames[SocialMediaPlatform['TWITTER']] })
                .getRawMany();


            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.content,
                channel: queryResult.socialimage,
                scheduled_at: queryResult.schedule_date,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views }
                ]
            }));
            return data.length;
        }
        catch (error) {
            throw error;
        }
    }


    // for instagram
    async getTotalInstagramPostList(userId: number): Promise<any> {
        try {

            const postTasks = await this.repository.createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'p.id AS post_id',
                    'a.url AS image',
                    'p.content AS content',
                    'sm.platform AS socialimage',
                    'pt.scheduled_at AS schedule_date',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                    'p.hashtags AS hashtags',
                    'ur.name AS user',
                    'ur.profilePicture AS profileimage',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .andWhere('pt.user_id = :userid', { userid: userId })
                .andWhere('sm.platform = :platform', { platform: SocialMediaPlatformNames[SocialMediaPlatform['INSTAGRAM']] })
                .getRawMany();


            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.content,
                channel: queryResult.socialimage,
                scheduled_at: queryResult.schedule_date,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views }
                ]
            }));

            return data.length;
        }
        catch (error) {
            throw error;
        }

    }

    async getTotalInstagramApprovedPostList(userId: number): Promise<any> {
        try {

            const postTasks = await this.repository.createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'p.id AS post_id',
                    'a.url AS image',
                    'p.content AS content',
                    'sm.platform AS socialimage',
                    'pt.scheduled_at AS schedule_date',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                    'p.hashtags AS hashtags',
                    'ur.name AS user',
                    'ur.profilePicture AS profileimage',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .andWhere('pt.user_id = :userid', { userid: userId })
                .andWhere('pt.status IN (:...statuses)', { statuses: [POST_TASK_STATUS.EXECUTE_SUCCESS, POST_TASK_STATUS.SCHEDULED] })
                .andWhere('sm.platform = :platform', { platform: SocialMediaPlatformNames[SocialMediaPlatform['INSTAGRAM']] })
                .getRawMany();


            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.content,
                channel: queryResult.socialimage,
                scheduled_at: queryResult.schedule_date,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views }
                ]
            }));

            return data.length;
        }
        catch (error) {
            throw error;
        }

    }

    async getTotalInstagramRejectedPostList(userId: number): Promise<any> {
        try {

            const postTasks = await this.repository.createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'p.id AS post_id',
                    'a.url AS image',
                    'p.content AS content',
                    'sm.platform AS socialimage',
                    'pt.scheduled_at AS schedule_date',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                    'p.hashtags AS hashtags',
                    'ur.name AS user',
                    'ur.profilePicture AS profileimage',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .andWhere('pt.user_id = :userid', { userid: userId })
                .andWhere('pt.status = :status', { status: POST_TASK_STATUS.REJECTED })
                .andWhere('sm.platform = :platform', { platform: SocialMediaPlatformNames[SocialMediaPlatform['INSTAGRAM']] })
                .getRawMany();

            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.content,
                channel: queryResult.socialimage,
                scheduled_at: queryResult.schedule_date,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views }
                ]
            }));

            return data.length;
        }
        catch (error) {
            throw error;
        }
    }
}
