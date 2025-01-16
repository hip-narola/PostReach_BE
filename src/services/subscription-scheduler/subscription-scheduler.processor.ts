import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SubscriptionSchedulerService } from './subscription-scheduler.service';
import { PostService } from '../schedule-post/schedule-post.service';

@Processor('subscriptionScheduler') // Queue name

export class SubscriptionSchedulerProcessor extends WorkerHost {
    constructor(
        private readonly subscriptionSchedulerService: SubscriptionSchedulerService,
        private readonly postService: PostService,
    ) {
        super(); // Call the constructor of WorkerHost
    }

    async process(job: Job) {
        const expiredSubscriptions = await this.subscriptionSchedulerService.checkAndExpireSubscriptions();

        // Call method to remove expired scheduled posts
      //  await this.postService.removeExpiredScheduledPosts(expiredSubscriptions);
    }
}
