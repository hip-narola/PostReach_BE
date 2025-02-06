import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { PostTask } from 'src/entities/post-task.entity';
import { DashboardInsightsController } from 'src/controllers/dashboard-insights/dashboard-insights.controller';
import { DashboardInsightsService } from 'src/services/dashboard-insights/dashboard-insights.service';
import { HttpModule } from '@nestjs/axios';
import { SocialMediaInsightsService } from 'src/services/social-media-insights/social-media-insights.service';
import { FacebookService } from 'src/services/facebook/facebook.service';
import { SocialMediaAccountModule } from '../social-media-account/social-media-account.module';
import { InstagramService } from 'src/services/instagram/instagram.service';
import { LinkedinService } from 'src/services/linkedin/linkedin.service';
import { NotificationModule } from '../notification/notification.module';
import { CheckUserSubscriptionService } from 'src/services/check-user-subscription/check-user-subscription.service';
import { AwsSecretsServiceModule } from '../aws-secrets-service/aws-secrets-service.module';
import { Logger } from 'src/services/logger/logger.service';
@Module({
    imports: [TypeOrmModule.forFeature([PostTask]),
        UnitOfWorkModule, HttpModule, SocialMediaAccountModule, NotificationModule, AwsSecretsServiceModule],
    controllers: [DashboardInsightsController],
    providers: [DashboardInsightsService, SocialMediaInsightsService, FacebookService, InstagramService, LinkedinService, CheckUserSubscriptionService, Logger],
    exports: [DashboardInsightsService],
})
export class DashboardInsightsModule { }