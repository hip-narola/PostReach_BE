import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobSchedulerService } from 'src/scheduler/job-scheduler-service';
import { SubscriptionService } from 'src/services/subscription/subscription.service';
import { Logger } from 'src/services/logger/logger.service';

@Processor('subscription-queue') // Queue name

export class SubscriptionProcessor extends WorkerHost {
    constructor(
        private readonly jobSchedulerService: JobSchedulerService,
        private readonly subscriptionService: SubscriptionService
    ) {
        super(); // Call the constructor of WorkerHost
    }

    async process(job: Job) {
        const logger = new Logger()
        const message = `Processing job:', ${job.name}, ${job.id}, ${new Date()}`;
        logger.log(message);

        const expiredUserIds = await this.subscriptionService.checkAndExpireSubscriptions();
        console.log('expiredSubscriptions data', expiredUserIds)
        // Call method to remove expired scheduled posts
        await this.jobSchedulerService.removeExpiredScheduledPosts(expiredUserIds);
    }
}
