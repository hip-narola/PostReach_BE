import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CheckTokenExpiryGuard } from './shared/common/guards/check-token-expiry-guard/check-token-expiry-guard.guard';
import { EmailService } from './services/email/email.service';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './shared/filters/global-exception/global-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response/response.interceptor';
import { Logger } from './services/logger/logger.service';
import { UserModule } from './modules/user/user.module';
import { ImageUploadService } from './services/image-upload/image-upload.service';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { ImageUploadModule } from './src/modules/image-upload/image-upload.module';
import { TwitterService } from './services/twitter/twitter.service';
import { LinkPageModule } from './modules/link-page/link-page.module';
import { LinkPageController } from './controllers/link-page/link-page.controller';
import { LinkedinService } from './services/linkedin/linkedin.service';
import { SocialMediaAccountService } from './services/social-media-account/social-media-account.service';
import { SocialMediaAccountModule } from './modules/social-media-account/social-media-account.module';
import { UnitOfWorkModule } from './modules/unit-of-work.module';
import { InstagramService } from './services/instagram/instagram.service';
import { FacebookService } from './services/facebook/facebook.service';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { QuestionnaireModule } from './modules/questionnaire/questionnaire.module';
import { QuestionnaireService } from './services/questionnaire/questionnaire.service';
import { AwsSecretsService } from './services/aws-secrets/aws-secrets.service';
import { ApprovalQueueModule } from './modules/approval-queue/approval-queue.module';
import { ApprovalQueueService } from './services/approval-queue/approval-queue.service';
import { CalenderModule } from './modules/calender/calender.module';
import { CalenderService } from './services/calender/calender.service';
import { PostHistoryModule } from './modules/post-history/post-history.module';
import { BullQueueModule } from './modules/bull/bull-queue.module';
import { DashboardInsightsModule } from './modules/dashboard-insights/dashboard-insights.module';
import { DashboardInsightsService } from './services/dashboard-insights/dashboard-insights.service';
import { HttpModule } from '@nestjs/axios';
import { SocialMediaInsightsModule } from './modules/social-media-insights/social-media-insights.module';
import { SocialMediaInsightsService } from './services/social-media-insights/social-media-insights.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { NotificationModule } from './modules/notification/notification.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './modules/redis/redis-module';
import { CacheModule } from './modules/cache/cache-module';
import { UserBusinessModule } from './modules/user/user-business.module';
import { GeneratePostModule } from './modules/generate-post/generate-post.module';
import { GeneratePostService } from './services/generate-post/generate-post.service';
import { SubscriptionService } from './services/subscription/subscription.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}` || '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10, // Time to live in seconds
        limit: 1000, // Maximum number of requests
      },
    ]),
    DatabaseModule,
    CalenderModule,
    AuthModule,
    BullQueueModule,
    DashboardInsightsModule,
    HttpModule,
    SocialMediaInsightsModule,
    ApprovalQueueModule,
    UserModule,
    SupabaseModule,
    ImageUploadModule,
    SocialMediaAccountModule,
    LinkPageModule,
    UnitOfWorkModule,
    OnboardingModule,
    QuestionnaireModule,
    PostHistoryModule,
    NotificationModule,
    PaymentModule,
    RedisModule,
    CacheModule,
    UserBusinessModule,
    GeneratePostModule,
  ],
  controllers: [AppController, LinkPageController],
  providers: [
    AppService,
    CheckTokenExpiryGuard,
    EmailService,
    Logger,
    {
      provide: APP_FILTER,
      useFactory: (loggerService: Logger) =>
        new GlobalExceptionFilter(loggerService),
      inject: [Logger],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    ImageUploadService,
    TwitterService,
    LinkedinService,
    SocialMediaAccountService,
    InstagramService,
    FacebookService,
    QuestionnaireService,
    AwsSecretsService,
    ApprovalQueueService,
    CalenderService,
    DashboardInsightsService,
    SocialMediaInsightsService,
    SubscriptionService,
    GeneratePostService,
  ],
  exports: [AwsSecretsService],
})
export class AppModule {}
