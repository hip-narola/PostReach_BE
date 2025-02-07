import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostTask } from 'src/entities/post-task.entity';
import { POST_TASK_STATUS } from 'src/shared/constants/post-task-status-constants';

@Injectable()
export class PostTaskRepository extends GenericRepository<PostTask> {
    constructor(
        @InjectRepository(PostTask)
        repository: Repository<PostTask>,
    ) {
        super(repository);
    }

    async fetchPostsofUser(user_id: number): Promise<PostTask[]> {
        const currentDate = new Date();
        const currentDateOnly = currentDate.toISOString().split('T')[0];
        return await this.repository
            .createQueryBuilder('postTask')
            .leftJoinAndSelect('postTask.post', 'post')
            .leftJoinAndSelect(
                'postTask.socialMediaAccount',
                'socialMediaAccount',
            )
            .leftJoinAndSelect('socialMediaAccount.user', 'user')
            .where('postTask.user_id = :user_id', { user_id })
            .andWhere('postTask.status = :status', {
                status: POST_TASK_STATUS.SCHEDULED,
            })
            // .andWhere('postTask.created_at = :created_at', {
            //     created_at: currentDateOnly,
            // })
            .getMany();
    }

    // async removeExpiredScheduledPosts(
    //     expiredSubscriptions: { userId: number; endDate: Date; subscription: string; cycle: number }[]
    // )
    // : Promise<{ userId: number; endDate: Date; subscription: string, cycle: number }[]>

    // async fetchPostTaskOfSocialMedia(social_media_ids:[]): Promise<PostTask[]> {
    //     const statuses = [POST_TASK_STATUS.PENDING, POST_TASK_STATUS.SCHEDULED];

    //     const posts = await this.repository
    //     .createQueryBuilder('postTask')
    //     .leftJoinAndSelect('postTask.post', 'post')
    //     .leftJoinAndSelect('post.assets', 'assets')
    //     .leftJoinAndSelect('postTask.socialMediaAccount', 'socialMediaAccount')
    //     .leftJoinAndSelect('socialMediaAccount.user', 'user')
    //     .andWhere('postTask.status IN (:...statuses)', { statuses })
    //     .andWhere('socialMediaAccount.id IN (:...socialMediaIds)', { socialMediaIds })
    //     .groupBy('socialMediaAccount.id')  // Group by social media account
    //     .addSelect('COUNT(postTask.id)', 'postTaskCount')  // Count the number of PostTasks
    //     .orderBy('postTaskCount', 'DESC')  // Order by the count of PostTasks
    //     .limit(1)  // Only get the social media account with the most PostTasks
    //     .getRawOne();  // Use `getRawOne` to get the aggregated result

    // // If no posts are found, return an empty array
    // if (!posts) return [];


    //     const posts = await this.repository
    //         .createQueryBuilder('postTask')
    //         .leftJoinAndSelect('postTask.post', 'post')
    //         .leftJoinAndSelect('post.assets', 'assets')
    //         .leftJoinAndSelect('postTask.socialMediaAccount', 'socialMediaAccount')
    //         .leftJoinAndSelect('socialMediaAccount.user', 'user')
    //         .andWhere('postTask.status IN (:...statuses)', { statuses: [POST_TASK_STATUS.PENDING, POST_TASK_STATUS.SCHEDULED] })
    //         .andWhere('postTask.socialMediaAccount IN (:...ids)', {
    //             ids: social_media_ids,
    //         })
    //         .groupBy('socialMediaAccount.id')
    //         .getMany();

    //     return posts;


    // }

    async fetchPostTaskOfSocialMedia(social_media_ids: number[]): Promise<PostTask[]> {
        const statuses = [POST_TASK_STATUS.PENDING, POST_TASK_STATUS.SCHEDULED];
    
        const posts = await this.repository
            .createQueryBuilder('postTask') // Alias for post_task table
            .leftJoinAndSelect('postTask.post', 'post')
            .leftJoinAndSelect('post.assets', 'assets')
            .leftJoinAndSelect('postTask.socialMediaAccount', 'socialMediaAccount')
            .leftJoinAndSelect('socialMediaAccount.user', 'user')
            .andWhere('postTask.status IN (:...statuses)', { statuses })
            .andWhere('socialMediaAccount.id IN (:...social_media_ids)', { social_media_ids })
            .addSelect(
                qb => {
                    return qb
                        .select('COUNT(postTask.id)')
                        .from(PostTask, 'postTask')  // Reference to the PostTask table in the subquery
                        .where('postTask.social_media_account_id = socialMediaAccount.id');
                },
                'postTaskCount'
            )  // Add subquery to count PostTask per social media account
            .groupBy('socialMediaAccount.id')  // Group by social media account to count tasks
            .orderBy('postTaskCount', 'DESC')  // Order by the highest count of PostTasks
            .limit(1)  // Limit to the social media account with the highest task count
            .getMany();  // Get all the posts related to that top account
    
        console.log('new posts', posts);
        return posts;
    }

}
