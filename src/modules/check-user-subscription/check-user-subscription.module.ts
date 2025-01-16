import { Module } from '@nestjs/common';
import { CheckUserSubscriptionController } from 'src/controllers/check-user-subscription/check-user-subscription.controller';
import { CheckUserSubscriptionService } from 'src/services/check-user-subscription/check-user-subscription.service';
import { UnitOfWorkModule } from '../unit-of-work.module';

@Module({
    imports: [UnitOfWorkModule],
    controllers: [CheckUserSubscriptionController],
    providers: [CheckUserSubscriptionService],
})
export class CheckUserSubscriptionModule { }