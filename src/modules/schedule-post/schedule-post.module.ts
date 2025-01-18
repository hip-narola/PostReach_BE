import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ConfigService } from '@nestjs/config';
import { SchedulePostController } from 'src/controllers/schedule-post/schedule-post.controller';
import { ApprovalQueueService } from 'src/services/approval-queue/approval-queue.service';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { CheckUserSubscriptionService } from 'src/services/check-user-subscription/check-user-subscription.service';
import { EmailService } from 'src/services/email/email.service';
import { FacebookService } from 'src/services/facebook/facebook.service';
import { InstagramService } from 'src/services/instagram/instagram.service';
import { LikesCommentsViewsSchedulerService } from 'src/services/likes-comments-views-scheduler/likes-comments-views-scheduler.service';
import { LikesCommentsViewsSchedulerProcessor } from 'src/services/likes-comments-views-scheduler/LikesCommentsViewsSchedulerProcessor.processor';
import { LinkedinService } from 'src/services/linkedin/linkedin.service';
import { PostService } from 'src/services/schedule-post/schedule-post.service';
import { PostProcessor } from 'src/services/schedule-post/schedule-queue.processor';
import { SchedulerProcessor } from 'src/services/scheduler-service/hourly-scheduler.service';
import { SchedulerService } from 'src/services/scheduler-service/scheduler-service.service';
import { SocialMediaInsightsService } from 'src/services/social-media-insights/social-media-insights.service';
import { SubscriptionSchedulerProcessor } from 'src/services/subscription-scheduler/subscription-scheduler.processor';
import { SubscriptionSchedulerService } from 'src/services/subscription-scheduler/subscription-scheduler.service';
import { SubscriptionService } from 'src/services/subscription/subscription.service';
import { TwitterService } from 'src/services/twitter/twitter.service';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';
import { AwsSecretsServiceModule } from '../aws-secrets-service/aws-secrets-service.module';
import { DashboardInsightsModule } from '../dashboard-insights/dashboard-insights.module';
import { NotificationModule } from '../notification/notification.module';
import { SocialMediaAccountModule } from '../social-media-account/social-media-account.module';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    AwsSecretsServiceModule,
    BullModule.forRootAsync({
      imports: [ConfigModule, AwsSecretsServiceModule],
      inject: [ConfigService, AwsSecretsService],
      useFactory: async (
        configService: ConfigService,
        secretsService: AwsSecretsService,
      ) => {
        const secrets = await secretsService.getSecret(
          AWS_SECRET.AWSSECRETNAME,
        );
        return {
          connection: {
            host: 'redis-11619.c114.us-east-1-4.ec2.redns.redis-cloud.com', //secrets.REDIS_HOST,
            port: 11619, //parseInt(secrets.REDIS_PORT, 10),
            password: '4ijX6KOTVR6biLMpMIOu6H7qI40OIWcg',//secrets.REDIS_PASSWORD,
            connectTimeout: 10000,
          },
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
    CheckUserSubscriptionService,
    AwsSecretsService,
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
    ApprovalQueueService,
  ],
})
export class SchedulePostModule {}
