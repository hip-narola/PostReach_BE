import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GenericRepository } from './generic-repository';
import { PostTask } from 'src/entities/post-task.entity';
import { PaginationParamDto } from 'src/dtos/params/pagination-param.dto';
import { PaginatedResponseDto } from 'src/dtos/response/pagination-response.dto';
import { SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';
import { POST_TASK_STATUS } from 'src/shared/constants/post-task-status-constants';

@Injectable()
export class ApprovalQueueRepository extends GenericRepository<PostTask> {
    constructor(repository: Repository<PostTask>) {
        super(repository);
    }

    async getApprovalQueueList(
        paginatedParams: PaginationParamDto,
    ): Promise<PaginatedResponseDto> {
        try {
            const postTasks = await this.repository
                .createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'p.id AS post_id',
                    'a.url AS image',
                    'p.content AS captions',
                    'p.hashtags AS hashtags',
                    'sm.platform AS channel',
                    'pt.scheduled_at AS schedule_date',
                    'ur.name AS user',
                    'sm.user_profile AS profileimage',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: 'image' })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .where('pt.status = :status', { status: POST_TASK_STATUS.PENDING })
                .andWhere('pt.user_id = :userid', { userid: paginatedParams.userId })
                .andWhere('pt.scheduled_at > :now', { now: new Date() })
                .getRawMany();

            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.captions,
                hashtags: queryResult.hashtags
                    ? queryResult.hashtags.split(',')
                    : [],
                channel: Object.keys(SocialMediaPlatformNames).find(
                    (key) =>
                        SocialMediaPlatformNames[key] == queryResult.channel,
                ),
                scheduled_at: queryResult.schedule_date,
                user: queryResult.user,
                profileImage: queryResult.profileimage || null,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views },
                ],
            }));

            const totalCount = postTasks.length;
            const offset =
                (paginatedParams.pageNumber - 1) * paginatedParams.limit;
            const paginatedTasks = data.slice(
                offset,
                offset + paginatedParams.limit,
            );
            const totalPages =
                paginatedParams.limit > 0
                    ? Math.ceil(totalCount / paginatedParams.limit)
                    : 0;
            return new PaginatedResponseDto(
                paginatedTasks,
                totalCount,
                totalPages,
                paginatedParams.pageNumber,
            );
        } catch (error) {
            throw error;
        }
    }

    async getScheduledPostByPostTaskID(id: number): Promise<any> {
        try {
            const queryResult = await this.repository
                .createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'p.id AS post_id',
                    'p.created_at AS post_created_at',
                    'a.url AS image',
                    'p.content AS captions',
                    'p.hashtags AS hashtags',
                    'sm.platform AS channel',
                    'sm.encrypted_access_token AS accessToken',
                    'sm.token_type AS token_type',
                    'sm.page_id AS pageId',
                    'sm.social_media_user_id AS social_media_user_id',
                    'sm.instagram_Profile As instagramID',
                    'pt.scheduled_at AS schedule_date',
                    'ur.name AS user',
                    'ur.id AS user_id',
                    'ur.profilePicture AS profileimage',
                    'p.no_of_likes AS no_of_likes',
                    'p.no_of_comments AS no_of_comments',
                    'p.no_of_views AS no_of_views',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: 'image' })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .where('pt.status = :status', { status:POST_TASK_STATUS.SCHEDULED })
                .andWhere('pt.id = :id', { id })
                .orderBy('pt.scheduled_at', 'DESC')
                .getRawOne();

            if (!queryResult) {
                throw new Error(`No scheduled post found with id: ${id}`);
            }

            const data = {
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                social_media_user_id: queryResult.social_media_user_id ?? null,
                userId: queryResult.user_id,
                token_type: queryResult.token_type ?? null,
                content: queryResult.captions,
                hashtags: queryResult.hashtags
                    ? queryResult.hashtags.split(',')
                    : [],
                channel: queryResult.channel,
                scheduled_at: queryResult.schedule_date,
                accessToken: queryResult.accesstoken,
                instagramId: queryResult.instagramid,
                pageId: queryResult.pageid,
                user: queryResult.user,
                post_created_at: queryResult.post_created_at,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views },
                ],
                
            };
            return data;
        } catch (error) {
            throw error;
        }
    }
}
