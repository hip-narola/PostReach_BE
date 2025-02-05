import { Module } from '@nestjs/common';
import { SubscriptionService } from 'src/services/subscription/subscription.service';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { NotificationModule } from '../notification/notification.module';
import { EmailService } from 'src/services/email/email.service';
import { SocialMediaAccountModule } from '../social-media-account/social-media-account.module';
import { AwsSecretsServiceModule } from '../aws-secrets-service/aws-secrets-service.module';
import { GeneratePostService } from 'src/services/generate-post/generate-post.service';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../user/user.module';
import { UserCreditRepository } from 'src/repositories/user-credit-repository';

@Module({
    imports: [NotificationModule, SocialMediaAccountModule, AwsSecretsServiceModule, HttpModule, UserModule],
    providers: [UnitOfWork, SubscriptionService, EmailService, GeneratePostService, UserCreditRepository],
    exports: [SubscriptionService, EmailService, GeneratePostService, UserCreditRepository],
})

export class SubscriptionModule { }
