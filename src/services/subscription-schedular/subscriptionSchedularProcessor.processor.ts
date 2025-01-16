import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SubscriptionService } from '../subscription/subscription.service';


@Processor('subscriptionScheduler') // Queue name
export class subscriptionSchedulerProcessor extends WorkerHost {
    constructor(private readonly subscriptionService: SubscriptionService,
    ) {
        super();
    }

    async process(job: Job) {
        try {
            await this.subscriptionService.GeneratePostSubscriptionWise();
        } catch (error) {
            throw error;
        }
    }
}
