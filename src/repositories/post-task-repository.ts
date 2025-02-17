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

    async fetchPostsofUser(id: string, user_id: number): Promise<PostTask[]> {
        const data = await this.repository
            .createQueryBuilder('postTask')
            .leftJoinAndSelect('postTask.post', 'post')
            .leftJoinAndSelect('postTask.socialMediaAccount', 'socialMediaAccount')
            .leftJoinAndSelect('socialMediaAccount.user', 'user')
            .leftJoinAndSelect('user.userSubscriptions', 'userSubscription')
            .where('postTask.user_id = :user_id', { user_id })
            .andWhere('postTask.status = :status', {
                status: POST_TASK_STATUS.SCHEDULED,
            })
            .andWhere('userSubscription.id = :id', { id })
            // .andWhere('userSubscription.status IN (:...statuses)', { statuses: [UserSubscriptionStatusType.ACTIVE, UserSubscriptionStatusType.TRIAL] })
            .getMany();
        
        if (data.length) {
            const userSubscription = data[0].socialMediaAccount.user.userSubscriptions[0];
            const today = new Date();

            const startDate = new Date(userSubscription.start_Date); // Create a Date object from the start date
            startDate.setDate(startDate.getDate() + 14); // Add 14 days
            if (userSubscription.cycle == 1 && today > startDate) {
                // Filter tasks if conditions are met
                // const filteredTasks = data.filter(postTask => postTask.created_at > startDate);
                const filteredTasks = data.filter(postTask => postTask.scheduled_at > today && postTask.created_at >= startDate);
                return filteredTasks;
            }
            else {
                const filteredTasks = data.filter(postTask => postTask.scheduled_at > today);
                return filteredTasks;
            }
        }
        return [];
    }

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
