import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { UserCredit } from 'src/entities/user_credit.entity';
import { UserCreditStatusType } from 'src/shared/constants/user-credit-status-constants';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSubscriptionStatusType } from 'src/shared/constants/user-subscription-status-constants';

@Injectable()
export class UserCreditRepository extends GenericRepository<UserCredit> {
    constructor(@InjectRepository(UserCredit)
    repository: Repository<UserCredit>) {
        super(repository);
    }

    async findUserCreditDetailWithSocialAccount(userId: number, subscriptionId: string, socialMediaId: number): Promise<UserCredit> {

        // const currentDate = new Date();
        return this.repository
            .createQueryBuilder('userCredit')
            .leftJoinAndSelect('userCredit.user', 'user')
            .leftJoinAndSelect('userCredit.subscription', 'subscription')
            .leftJoinAndSelect('userCredit.social_media', 'social_media')
            .where('userCredit.user_id = :userId', { userId })
            // .andWhere('userCredit.status = :status', { status: UserCreditStatusType.ACTIVE })
            .andWhere('userCredit.subscription_id = :subscriptionId', { subscriptionId })
            // .andWhere('userCredit.status = :status', { status: UserCreditStatusType.ACTIVE })
            .andWhere('userCredit.social_media_id = :social_media_id', { social_media_id: socialMediaId })
            // .andWhere('userCredit.start_Date <= :currentDate', { currentDate })
            // .andWhere('userCredit.end_Date >= :currentDate', { currentDate })
            .andWhere('userCredit.current_credit_amount > 0')
            // TODO: Check if last_trigger_date is null then chek for check for subscription start date for 14 days
            // .andWhere('DATE(userCredit.last_trigger_date + INTERVAL \'14 days\') = DATE(:currentDate)', { currentDate })
            .getOne();
    }

    async findUserCreditDetail(userId: number, subscriptionId: string): Promise<UserCredit> {

        // const currentDate = new Date();
        return this.repository
            .createQueryBuilder('userCredit')
            .leftJoinAndSelect('userCredit.user', 'user')
            .leftJoinAndSelect('userCredit.subscription', 'subscription')
            .where('userCredit.user_id = :userId', { userId })
            .andWhere('userCredit.status = :status', { status: UserCreditStatusType.ACTIVE })
            .andWhere('userCredit.subscription_id = :subscriptionId', { subscriptionId })
            // .andWhere('userCredit.start_Date <= :currentDate', { currentDate })
            // .andWhere('userCredit.end_Date >= :currentDate', { currentDate })
            .andWhere('userCredit.current_credit_amount > 0')
            // TODO: Check if last_trigger_date is null then chek for check for subscription start date for 14 days
            // .andWhere('DATE(userCredit.last_trigger_date + INTERVAL \'14 days\') = DATE(:currentDate)', { currentDate })
            .getOne();
    }

    // async findTrialCreditByUserId(userId: number, subscriptionId: string): Promise<UserCredit> {
    //     const currentDate = new Date();
    //     return this.repository
    //     .createQueryBuilder('userCredit')
    //     .leftJoinAndSelect('userCredit.user', 'user')
    //     .leftJoinAndSelect('userCredit.subscription', 'subscription')
    //     .where('userCredit.user_id = :userId', { userId })
    //     .andWhere('userCredit.subscription_id = :subscriptionId', { subscriptionId })
    //     .andWhere('userCredit.start_Date <= :currentDate', { currentDate })
    //     .andWhere('userCredit.end_Date >= :currentDate', { currentDate })
    //     .andWhere('userCredit.status = :status', { status: UserCreditStatusType.ACTIVE })
    //     .andWhere('userCredit.current_credit_amount > 0')
    //     .getOne();
    // }


    async findUserAndSubscription(
        userId: number,
        subscriptionId: string,
    ): Promise<UserCredit> {
        return this.repository.findOne({
            where: {
                user: { id: userId },
                subscription: { id: subscriptionId },
            },
            relations: ['user', 'subscription'],
        });
    }

    //Get credit of user with social media 
    async getUserCreditWithSocialMedia(userId: number, socialMediaAccountId: number): Promise<UserCredit> {
        return this.repository.findOne({
            where: {
                user: { id: userId },
                social_media_id: socialMediaAccountId,
                status: UserCreditStatusType.ACTIVE,
            },
        });
    }

    //Get all credit of user
    async getUserCredits(userId: number): Promise<UserCredit> {
        return this.repository.findOne({
            where: {
                user: { id: userId },
                status: UserCreditStatusType.ACTIVE,
            },
        });
    }

    //Update as expired where user id match
    async updateUserCreditsToExpired(userId: number): Promise<void> {
        await this.repository.update(
            { user: { id: userId } },
            { status: UserCreditStatusType.EXPIRED }
        );
    }

    //Update as expired where user id and status active match
    async updateUserCreditsStatus(userId: number): Promise<void> {
        await this.repository.update(
            {
                user: { id: userId },
                status: UserCreditStatusType.ACTIVE,
            },
            {
                status: UserCreditStatusType.EXPIRED,
                cancel_Date: new Date()
            }
        );
    }

    async getAllUserCredits(userId: number): Promise<UserCredit[]> {
        return this.repository.find({
            where: {
                user: { id: userId },
                status: UserCreditStatusType.ACTIVE,
            },
            relations: ['social_media', 'user'],
        });
    }

    async findOneCredit(postId: string): Promise<UserCredit> {
        return await this.repository.findOne({
            where: { id: postId },
            relations: ['social_media', 'user', 'subscription', 'PostRetry'],
        });
    }


    async getAllUserToGeneratePost(): Promise<UserCredit[]> {
        const currentDate = new Date();
        const currentDateOnly = currentDate.toISOString().split('T')[0];

		return await this.repository
			.createQueryBuilder('user_credit')
			.leftJoinAndSelect('user_credit.user', 'user')
			.leftJoin('user.userSubscriptions', 'user_subscription')
			.andWhere('user_subscription.status = :status', { status: UserSubscriptionStatusType.ACTIVE })
			.andWhere('user_credit.status = :status', { status: UserCreditStatusType.ACTIVE })
            .andWhere('user_credit.current_credit_amount > :current_credit_amount', { current_credit_amount: 0 })
			.andWhere('user_subscription.cycle >= :cycle', { cycle: 1 })
			.andWhere("DATE(user_subscription.start_Date) + INTERVAL '14 days' = :currentDateOnly", { currentDateOnly: currentDateOnly })
			.getMany();
	}

    async getAllUserCreditsOncreate(userId: number): Promise<UserCredit[]> {
        return this.repository.find({
            where: {
                user: { id: userId },
                status: UserCreditStatusType.ACTIVE,
            },
            relations: ['social_media', 'user'],
            order: {
                start_Date: 'DESC', // Order by start_Date in descending order
            },
        });
    }
}

