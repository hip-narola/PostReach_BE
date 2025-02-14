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

        // Step 1: First, find the social media account with the highest number of post tasks
        const topSocialMediaAccount = await this.repository
            .createQueryBuilder('postTask')
            .select('postTask.social_media_account_id', 'socialMediaAccountId')
            .addSelect('COUNT(postTask.id)', 'postTaskCount') // Here, the alias `postTaskCount` is valid
            .where('postTask.status IN (:...statuses)', { statuses })
            .andWhere('postTask.scheduled_at > :currentDate', { currentDate: new Date() })
            .andWhere('postTask.social_media_account_id IN (:...social_media_ids)', { social_media_ids })
            .groupBy('postTask.social_media_account_id')
            .orderBy('"postTaskCount"', 'DESC') // Use double quotes around the alias
            .limit(1)
            .getRawOne(); // Use `getRawOne` since you're using raw SQL and need access to the alias.

        if (!topSocialMediaAccount) {
            return []; // No social media account found
        }

        const topSocialMediaAccountId = topSocialMediaAccount.socialMediaAccountId;

        // Step 2: Fetch all post tasks for the top social media account
        const posts = await this.repository
            .createQueryBuilder('postTask')
            .leftJoinAndSelect('postTask.post', 'post')
            .leftJoinAndSelect('post.assets', 'assets')
            .leftJoinAndSelect('postTask.socialMediaAccount', 'socialMediaAccount')
            .leftJoinAndSelect('socialMediaAccount.user', 'user')
            .where('postTask.status IN (:...statuses)', { statuses })
            .andWhere('postTask.social_media_account_id = :topSocialMediaAccountId', { topSocialMediaAccountId })
            .orderBy('postTask.scheduled_at', 'DESC') // Use double quotes around the alias
            .getMany();

        return posts;
    }


}
