import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/entities/post.entity';
import {
    SocialMediaPlatform,
    SocialMediaPlatformNames,
} from 'src/shared/constants/social-media.constants';
import { UserSubscriptionStatusType } from 'src/shared/constants/user-subscription-status-constants';
import { POST_TASK_STATUS } from 'src/shared/constants/post-task-status-constants';

@Injectable()
export class PostRepository extends GenericRepository<Post> {
    constructor(
        @InjectRepository(Post)
        repository: Repository<Post>,
    ) {
        super(repository);
    }

    async fetchTwitterPosts() {
        return await this.fetchPosts(
            `${SocialMediaPlatformNames[SocialMediaPlatform.TWITTER]}`,
        );
    }

    // fetch posts with platform instagram
    async fetchLinkedInPosts() {
        return await this.fetchPosts(
            `${SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN]}`,
        );
    }

    async fetchPosts(platform: string) {
        const posts = await this.repository
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.postTask', 'postTask')
            .leftJoinAndSelect(
                'postTask.socialMediaAccount',
                'socialMediaAccount',
            )
            .leftJoinAndSelect('socialMediaAccount.user', 'user')
            .leftJoinAndSelect(
                'user.userSubscriptions',
                'userSubscription',
                'userSubscription.status IN (:...statuses)', // Filter user subscriptions by status
                {
                    statuses: [
                        UserSubscriptionStatusType.TRIAL,
                        UserSubscriptionStatusType.ACTIVE,
                    ],
                }
            )
            .where('socialMediaAccount.platform = :platform', { platform })
            .andWhere('postTask.status = :status', {
                status: POST_TASK_STATUS.EXECUTE_SUCCESS,
            })
            .getMany();

        return posts;
    }

    async findPostWithTask(postId: number): Promise<Post | null> {
        return await this.repository.findOne({
            where: { id: postId },
            relations: ['postTask'],
        });
    }
    
    async updateRejectedPost(postId: number): Promise<Post | null> {
        return await this.repository.findOne({
            where: { id: postId },
            relations: ['postTask'],
        });
    }

    async getPostsWithActiveSubscription() {
        const posts = await this.repository
            .createQueryBuilder('post')
            .innerJoin('post.postTask', 'postTask')
            .innerJoin('postTask.socialMediaAccount', 'socialMediaAccount')
            .innerJoin('socialMediaAccount.user', 'user')
            .andWhere('postTask.status = :status', { status: POST_TASK_STATUS.EXECUTE_SUCCESS })
            .andWhere(
                `EXISTS (
                    SELECT 1 FROM user_subscription us
                    WHERE us.user_id = user.id
                    AND us.status IN (:...statuses)
                )`,
                {
                    statuses: [
                        UserSubscriptionStatusType.TRIAL,
                        UserSubscriptionStatusType.ACTIVE,
                    ],
                }
            )
            .select([
                'post.id',
                'post.external_platform_id',
                'postTask.id',
                'postTask.status',
                'socialMediaAccount.id',
                'socialMediaAccount.platform',
                'socialMediaAccount.encrypted_access_token',
            ])
            .getMany();
        return posts;
    }
    
}
