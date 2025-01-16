import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { SubscriptionService } from '../subscription/subscription.service';


@Injectable()
export class SubscriptionSchedulerService {
    private redisClient: Redis;
    constructor(@InjectQueue('subscriptionScheduler')
    private readonly subscriptionQueue: Queue,
        private readonly subscriptionService: SubscriptionService,
    ) {

    }

    async onModuleInit() {
        // Add a repeatable job to run every minute
        await this.subscriptionQueue.add(
            'check-subscriptions',
            {}, // Job data, if needed
            {
                // repeat: {
                //     every: 5 * 60 * 1000, // Run every 5 minute
                // },
                repeat: {
                    every: 24 * 60 * 60 * 1000, // Every 24 hours
                    startDate: new Date().setHours(0, 1, 0, 0), // Start at 12:01 AM
                }
            },
        );
    }

    async checkAndExpireSubscriptions(): Promise<{ userId: number; endDate: Date; subscription: string, cycle: number }[]> {
        return await this.subscriptionService.checkAndExpireSubscriptions();
    }
}
