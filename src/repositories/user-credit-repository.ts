import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { UserCredit } from 'src/entities/user_credit.entity';
import { UserCreditStatusType } from 'src/shared/constants/user-credit-status-constants';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserCreditRepository extends GenericRepository<UserCredit> {
    constructor(@InjectRepository(UserCredit)
    repository: Repository<UserCredit>) {
        super(repository);
    }

    async findUserCreditDetailWithSocialAccount(userId: number, subscriptionId: string, socialMediaId: number): Promise<UserCredit | null> {

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

    async findUserCreditDetail(userId: number, subscriptionId: string): Promise<UserCredit | null> {

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

    // async findTrialCreditByUserId(userId: number, subscriptionId: string): Promise<UserCredit | null> {
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
    ): Promise<UserCredit | null> {
        return this.repository.findOne({
            where: {
                user: { id: userId },
                subscription: { id: subscriptionId },
            },
            relations: ['user', 'subscription'],
        });
    }

    //Get credit of user with social media 
    async getUserCreditWithSocialMedia(userId: number, socialMediaAccountId: number): Promise<UserCredit | null> {
        return this.repository.findOne({
            where: {
                user: { id: userId },
                social_media_id: socialMediaAccountId,
                status: UserCreditStatusType.ACTIVE,
            },
        });
    }

    //Get all credit of user
    async getUserCredits(userId: number): Promise<UserCredit | null> {
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

    async getAllUserCredits(userId: number): Promise<UserCredit[] | null> {
        return this.repository.find({
            where: {
                user: { id: userId },
                status: UserCreditStatusType.ACTIVE,
            },
            relations: ['social_media', 'user'],
        });
    }

    async findOneCredit(postId: string): Promise<UserCredit | null> {
        return await this.repository.findOne({
            where: { id: postId },
            relations: ['social_media', 'user', 'subscription', 'PostRetry'],
            
        });
    }
}

