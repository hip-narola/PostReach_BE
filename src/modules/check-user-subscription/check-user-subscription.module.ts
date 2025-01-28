import { Module } from '@nestjs/common';
import { CheckUserSubscriptionService } from 'src/services/check-user-subscription/check-user-subscription.service';
import { UnitOfWorkModule } from '../unit-of-work.module';

@Module({
    imports: [UnitOfWorkModule],
    controllers: [],
    providers: [CheckUserSubscriptionService],
})
export class CheckUserSubscriptionModule { }