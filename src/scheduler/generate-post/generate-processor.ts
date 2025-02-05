import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SubscriptionService } from '../../services/subscription/subscription.service';


@Processor('generate-post') // Queue name
export class GeneratePostProcessor extends WorkerHost {
    constructor(private readonly subscriptionService: SubscriptionService,
    ) {
        super();
    }

    async process(job: Job) {
        try {
            console.log("generate-post::: job started: ",  job);
            await this.subscriptionService.GeneratePostSubscriptionWiseOnFirstCycle();
        } catch (error) {
            console.log("generate-post::: error: ",  error);
            throw error;
        }
    }
}
