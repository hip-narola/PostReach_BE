import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SchedulePostProcessor } from 'src/scheduler/schedule-post/schedule-post.processor';
import { ApprovalQueueService } from 'src/services/approval-queue/approval-queue.service';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { PageInsightProcessor } from 'src/scheduler/page-insight/page-insight-processor';
import { SocialMediaInsightsService } from 'src/services/social-media-insights/social-media-insights.service';
import { DashboardInsightsModule } from '../dashboard-insights/dashboard-insights.module';
import { FacebookService } from 'src/services/facebook/facebook.service';
import { SocialMediaAccountModule } from '../social-media-account/social-media-account.module';
import { LinkedinService } from 'src/services/linkedin/linkedin.service';
import { PostInsightProcessor } from 'src/scheduler/post-insight/post-insight-processor';
import { InstagramService } from 'src/services/instagram/instagram.service';
import { TwitterService } from 'src/services/twitter/twitter.service';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { SubscriptionService } from 'src/services/subscription/subscription.service';
import { EmailService } from 'src/services/email/email.service';
import { AwsSecretsServiceModule } from '../aws-secrets-service/aws-secrets-service.module';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';
import { ConfigService } from '@nestjs/config';
import { JobSchedulerService } from 'src/scheduler/job-scheduler-service';
import { SubscriptionProcessor } from 'src/scheduler/subscription/subscription-processor';
import { GeneratePostProcessor } from 'src/scheduler/generate-post/generate-processor';
import { CacheModule } from '../cache/cache-module';
import { PostRepository } from 'src/repositories/post-repository';
import { Post } from 'src/entities/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratePostModule } from '../generate-post/generate-post.module';
import { PaymentModule } from '../payment/payment.module';
import { Logger } from 'src/services/logger/logger.service';
import { ApprovalQueueRepository } from 'src/repositories/approval-queue-repository';
import { PostTaskRepository } from 'src/repositories/post-task-repository';
import { PostTask } from 'src/entities/post-task.entity';
import { RejectReason } from 'src/entities/reject-reason.entity';
import { RejectReasonRepository } from 'src/repositories/reject-reason-repository';

async function getRedisConfig() {
    const configService = new ConfigService();
    const secretsService = new AwsSecretsService(configService);
    const secrets = await secretsService.getSecret(AWS_SECRET.AWSSECRETNAME);
    return {
        host: 'redis-11619.c114.us-east-1-4.ec2.redns.redis-cloud.com',//secrets.REDIS_HOST,
        port: 11619, //parseInt(secrets.REDIS_PORT, 10),
        password: '4ijX6KOTVR6biLMpMIOu6H7qI40OIWcg', //secrets.REDIS_PASSWORD,
        connectTimeout: 10000,
    };
}

@Module({
    imports: [
        TypeOrmModule.forFeature([Post, PostTask, RejectReason]),
        BullModule.forRootAsync({
            useFactory: async () => {
                const redisConfig = await getRedisConfig();
                return {
                    connection: redisConfig,
                    retryStrategy: (times: number) => { // Example retry strategy
                        const delay = Math.min(times * 50, 2000); // Exponential backoff
                        return delay;
                    }
                };
            },
        }),
        BullModule.registerQueue(
            { name: 'post-queue' },
            { name: 'post-insight' },
            { name: 'page-insight' },
            { name: 'generate-post' },
            { name: 'subscription-queue' },
            // { name: 'exchangeAccessTokenQueue' }
        ),
        UnitOfWorkModule,
        DashboardInsightsModule,
        SocialMediaAccountModule,
        UserModule,
        NotificationModule,
        AwsSecretsServiceModule,
        CacheModule,
        GeneratePostModule,
        PaymentModule
    ],
    providers: [

        JobSchedulerService,
        SchedulePostProcessor,
        PostInsightProcessor,
        PageInsightProcessor,
        GeneratePostProcessor,
        SubscriptionProcessor,
        ApprovalQueueService,
        SocialMediaInsightsService,
        FacebookService,
        LinkedinService,
        InstagramService,
        TwitterService,
        SubscriptionService,
        EmailService,
        PostRepository,
        Logger,
        ApprovalQueueRepository,
        PostTaskRepository,
        RejectReasonRepository
    ],
    exports: [
        BullModule,
        JobSchedulerService,
        FacebookService,
        LinkedinService,
        TwitterService,
        InstagramService,
        ApprovalQueueService,
        SubscriptionService,
        ApprovalQueueRepository,
        PostTaskRepository,
        RejectReasonRepository
    ],
})

export class BullQueueModule { }
