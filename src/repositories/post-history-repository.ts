import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GenericRepository } from './generic-repository';
import { PostTask } from 'src/entities/post-task.entity';
import { PaginationParamDto } from 'src/dtos/params/pagination-param.dto';
import { PaginatedResponseDto } from 'src/dtos/response/pagination-response.dto';
import { SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';
import { ASSET_TYPE } from 'src/shared/constants/asset-type-constants';
import { POST_TASK_STATUS } from 'src/shared/constants/post-task-status-constants';

@Injectable()
export class PostHistoryRepository extends GenericRepository<PostTask> {
    constructor(repository: Repository<PostTask>) {
        super(repository);
    }

    async getPostHistoryList(paginatedParams: PaginationParamDto): Promise<PaginatedResponseDto> {
        try {
            const query = this.repository.createQueryBuilder('pt')
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
                .addSelect('pt.scheduled_at::text AS scheduled_at')
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .where('pt.status = :status', { status: POST_TASK_STATUS.EXECUTE_SUCCESS })
                .andWhere('pt.user_id = :userid', { userid: paginatedParams.userId })
                .orderBy('pt.scheduled_at', 'DESC');

            const totalCount = await query.getCount();

            const postTasks = await query
                .skip((paginatedParams.pageNumber - 1) * paginatedParams.limit)
                .take(paginatedParams.limit)
                .getRawMany();

            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                postId: queryResult.post_id,
                image: queryResult.image,
                content: queryResult.content,
                hashtags: queryResult.hashtags ? queryResult.hashtags.split(',') : [],
                channel: Object.keys(SocialMediaPlatformNames).find(key => SocialMediaPlatformNames[key] === queryResult.socialimage),
                scheduled_at: queryResult.scheduled_at,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                analytics: [
                    { comments: queryResult.no_of_comments },
                    { likes: queryResult.no_of_likes },
                    { views: queryResult.no_of_views }
                ]
            }));

            const offset = (paginatedParams.pageNumber - 1) * paginatedParams.limit;
            const paginatedTasks = data.slice(offset, offset + paginatedParams.limit);
            const totalPages = paginatedParams.limit > 0 ? Math.ceil(totalCount / paginatedParams.limit) : 0;
            return new PaginatedResponseDto(paginatedTasks, totalCount, totalPages, paginatedParams.pageNumber);
        }
        catch (error) {
            throw error;
        }
    }

    async getPostTaskWithUserDetails(postTaskId: number): Promise<PostTask> {
        return this.repository.findOne({
            where: { id: postTaskId },
            relations: ['user'],
        });
    }
}