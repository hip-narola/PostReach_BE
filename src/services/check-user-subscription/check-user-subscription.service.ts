import { Injectable } from '@nestjs/common';
import { UserSubscription } from 'src/entities/user_subscription.entity';
import { UserSubscriptionRepository } from 'src/repositories/user-subscription-repository';
import { UnitOfWork } from 'src/unitofwork/unitofwork';

@Injectable()
export class CheckUserSubscriptionService {

    constructor(
        private readonly unitOfWork: UnitOfWork,
    ) { }
    async isUserSubscriptionActive(userId: number) {
        const userSubscriptionRepository = this.unitOfWork.getRepository(UserSubscriptionRepository, UserSubscription, false);
        const usersubscription = await userSubscriptionRepository.findUserActiveSubscriptionWithoutSubscriptionId(userId);
        // await this.unitOfWork.completeTransaction();
        if (usersubscription) {
            return true;
        }
        return false;
    }
}
