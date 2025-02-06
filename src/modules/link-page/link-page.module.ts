import { Module } from '@nestjs/common';
import { TwitterService } from 'src/services/twitter/twitter.service';
import { LinkPageController } from 'src/controllers/link-page/link-page.controller';
import { ConfigModule } from '@nestjs/config';
import { LinkedinService } from 'src/services/linkedin/linkedin.service';
import { PassportModule } from '@nestjs/passport';
import { SocialMediaAccountService } from 'src/services/social-media-account/social-media-account.service';
import { SocialMediaAccountModule } from '../social-media-account/social-media-account.module';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { TwitterModule } from '../twitter/twitter.module';
import { InstagramService } from 'src/services/instagram/instagram.service';
import { FacebookService } from 'src/services/facebook/facebook.service';
import { ImageUploadService } from 'src/services/image-upload/image-upload.service';
import { NotificationModule } from '../notification/notification.module';
import { SubscriptionService } from 'src/services/subscription/subscription.service';
import { EmailService } from 'src/services/email/email.service';
import { FacebookGroupStrategyProvider } from 'src/shared/common/configurations/social/facebook-group.strategy.provider';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { FacebookPageStrategyProvider } from 'src/shared/common/configurations/social/facebook-page.strategy.provider';
import { InstagramBusinessStrategyProvider } from 'src/shared/common/configurations/social/instagram-business.strategy.provider';
import { GeneratePostModule } from '../generate-post/generate-post.module';
import { PaymentModule } from '../payment/payment.module';
import { CacheModule } from '../cache/cache-module';
import { Logger } from 'src/services/logger/logger.service';
@Module({
    imports: [
        ConfigModule, PassportModule, TwitterModule, LinkPageModule, SocialMediaAccountModule, UnitOfWorkModule, NotificationModule, GeneratePostModule, PaymentModule, CacheModule],
    providers: [AwsSecretsService, TwitterService, FacebookGroupStrategyProvider, FacebookPageStrategyProvider, InstagramService, FacebookService, LinkedinService, InstagramBusinessStrategyProvider, SocialMediaAccountService, ImageUploadService, SubscriptionService, EmailService,Logger],
    controllers: [LinkPageController],
})
export class LinkPageModule { }
