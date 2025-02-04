import { Module } from '@nestjs/common';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { SubscriptionService } from 'src/services/subscription/subscription.service';
import { PaymentController } from 'src/controllers/payment/payment.controller';
import { NotificationModule } from '../notification/notification.module';
import { EmailService } from 'src/services/email/email.service';
import { SocialMediaAccountModule } from '../social-media-account/social-media-account.module';
import { AwsSecretsServiceModule } from '../aws-secrets-service/aws-secrets-service.module';
import { UserModule } from '../user/user.module';
import { UserSubscriptionRepository } from 'src/repositories/user-subscription-repository';
import { UserCreditRepository } from 'src/repositories/user-credit-repository';
import { GeneratePostModule } from '../generate-post/generate-post.module';
import { UserSubscription } from 'src/entities/user_subscription.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCredit } from 'src/entities/user_credit.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserSubscription, UserCredit]),
        UnitOfWorkModule,
        NotificationModule,
        SocialMediaAccountModule,
        AwsSecretsServiceModule,
        UserModule,
        GeneratePostModule,
    ],
    controllers: [PaymentController],
    providers: [
        SubscriptionService,
        EmailService, UserSubscriptionRepository, UserCreditRepository
    ],
    exports: [UserCreditRepository, UserSubscriptionRepository]
})
export class PaymentModule { }