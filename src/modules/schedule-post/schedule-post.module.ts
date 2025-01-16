import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { SchedulePostController } from 'src/controllers/schedule-post/schedule-post.controller';
import { PostProcessor } from 'src/services/schedule-post/schedule-queue.processor';
import { PostService } from 'src/services/schedule-post/schedule-post.service';
import { ApprovalQueueService } from 'src/services/approval-queue/approval-queue.service';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { SchedulerProcessor } from 'src/services/scheduler-service/hourly-scheduler.service';
import { SchedulerService } from 'src/services/scheduler-service/scheduler-service.service';
import { SocialMediaInsightsService } from 'src/services/social-media-insights/social-media-insights.service';
import { DashboardInsightsModule } from '../dashboard-insights/dashboard-insights.module';
import { FacebookService } from 'src/services/facebook/facebook.service';
import { SocialMediaAccountModule } from '../social-media-account/social-media-account.module';
import { LinkedinService } from 'src/services/linkedin/linkedin.service';
import { LikesCommentsViewsSchedulerService } from 'src/services/likes-comments-views-scheduler/likes-comments-views-scheduler.service';
import { LikesCommentsViewsSchedulerProcessor } from 'src/services/likes-comments-views-scheduler/LikesCommentsViewsSchedulerProcessor.processor';
import { InstagramService } from 'src/services/instagram/instagram.service';
import { TwitterService } from 'src/services/twitter/twitter.service';
import { UserModule } from '../user/user.module';
import { SubscriptionSchedulerService } from 'src/services/subscription-scheduler/subscription-scheduler.service';
import { SubscriptionSchedulerProcessor } from 'src/services/subscription-scheduler/subscription-scheduler.processor';
import { NotificationModule } from '../notification/notification.module';
import { SubscriptionService } from 'src/services/subscription/subscription.service';
import { CheckUserSubscriptionService } from 'src/services/check-user-subscription/check-user-subscription.service';
import { EmailService } from 'src/services/email/email.service';
import { AwsSecretsServiceModule } from '../aws-secrets-service/aws-secrets-service.module';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';
import { ConfigService } from '@nestjs/config';

async function getRedisConfig() {
    const configService = new ConfigService();
    const secretsService = new AwsSecretsService(configService);
    const secrets = await secretsService.getSecret(AWS_SECRET.AWSSECRETNAME);
    return {
        host: secrets.REDIS_HOST,
        port: parseInt(secrets.REDIS_PORT, 10),
        password: secrets.REDIS_PASSWORD,
        connectTimeout: 10000,
    };
}



@Module({
    imports: [
        BullModule.forRootAsync({
            useFactory: async () => {
                const redisConfig = await getRedisConfig();
                return {
                    connection: redisConfig,
                };
            },
        }),
        BullModule.registerQueue(
            { name: 'post-queue' },
            { name: 'hourly-scheduler-queue' },
            { name: 'likesCommentsViewsScheduler' },
            { name: 'subscriptionScheduler' },
            // { name: 'exchangeAccessTokenQueue' }
        ),
        UnitOfWorkModule,
        DashboardInsightsModule,
        SocialMediaAccountModule,
        UserModule,
        NotificationModule,
        AwsSecretsServiceModule
    ],
    controllers: [SchedulePostController],
    providers: [
        PostService,
        PostProcessor,
        ApprovalQueueService,
        SchedulerProcessor,
        SchedulerService,
        SocialMediaInsightsService,
        FacebookService,
        LinkedinService,
        InstagramService,
        LikesCommentsViewsSchedulerService,
        LikesCommentsViewsSchedulerProcessor,
        TwitterService,
        InstagramService,
        SubscriptionSchedulerService,
        SubscriptionSchedulerProcessor,
        SubscriptionService,
        EmailService,
        CheckUserSubscriptionService
    ],
    exports: [
        BullModule,
        PostService,
        SchedulerService,
        FacebookService,
        LinkedinService,
        LikesCommentsViewsSchedulerService,
        TwitterService,
        InstagramService,
        // SubscriptionSchedularService,
        ApprovalQueueService
    ],
})
export class SchedulePostModule { }
