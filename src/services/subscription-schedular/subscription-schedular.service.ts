import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class SubscriptionSchedularService {
    constructor(
        @InjectQueue('subscriptionScheduler')
        private readonly schedulerSubscriptionQueue: Queue
    ) { }

    async onModuleInit() {
        try {
            await this.scheduleDailyJob();
        } catch (error) {
           throw error;
        }
    }


    private async scheduleDailyJob() {
        const existingJobs = await this.schedulerSubscriptionQueue.getRepeatableJobs();
        const jobName = 'call-subscription-scheduler-service';

        // Prevent duplicate job schedules
        if (existingJobs.some((job) => job.name === jobName)) {
            return;
        }

        await this.schedulerSubscriptionQueue.add(
            jobName,
            {}, // Empty payload for the job
            {
                repeat: {
                    pattern: '0 0 * * *', // Cron pattern for daily at midnight
                    tz: 'UTC',
                },
                removeOnComplete: false,
                removeOnFail: false,
            }
        );
    }
}
