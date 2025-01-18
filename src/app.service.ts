import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerService } from './services/scheduler-service/scheduler-service.service';
import { LikesCommentsViewsSchedulerService } from './services/likes-comments-views-scheduler/likes-comments-views-scheduler.service';
import { SubscriptionSchedulerService } from './services/subscription-scheduler/subscription-scheduler.service';

@Injectable()
export class AppService implements OnModuleInit {
    constructor(
        private readonly schedulerService: SchedulerService,
        private readonly likesCommentsViewsSchedularService: LikesCommentsViewsSchedulerService,
        private readonly subscriptionSchedulerService: SubscriptionSchedulerService
    ) { }

    async onModuleInit() {
        await this.schedulerService.scheduleHourlyJob();
        await this.likesCommentsViewsSchedularService.onModuleInit();
        await this.subscriptionSchedulerService.onModuleInit();
    }
    getHello(): { message: string; data?: unknown } {
        return {
            message: 'Custom message from AppService',
            data: 'Hello World!',
        };
    }
}
