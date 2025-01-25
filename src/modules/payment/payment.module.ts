import { Module } from '@nestjs/common';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { SubscriptionService } from 'src/services/subscription/subscription.service';
import { PaymentController } from 'src/controllers/payment/payment.controller';
import { NotificationModule } from '../notification/notification.module';
import { EmailService } from 'src/services/email/email.service';
import { SocialMediaAccountModule } from '../social-media-account/social-media-account.module';
import { AwsSecretsServiceModule } from '../aws-secrets-service/aws-secrets-service.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        UnitOfWorkModule,
        NotificationModule,
        SocialMediaAccountModule,
        AwsSecretsServiceModule,
        UserModule
    ],
    controllers: [PaymentController],
    providers: [
        SubscriptionService,
        EmailService
    ],
})
export class PaymentModule { }