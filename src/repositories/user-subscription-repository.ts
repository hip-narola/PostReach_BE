import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Raw, Repository } from 'typeorm';
import { UserSubscription } from 'src/entities/user_subscription.entity';
import { SUBSCRIPTION_PLANS } from 'src/shared/constants/subscription-plan-name-constants';
import { UserSubscriptionStatusType } from 'src/shared/constants/user-subscription-status-constants';
import { In } from 'typeorm';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserSubscriptionRepository extends GenericRepository<UserSubscription> {
	private stripe: Stripe;
	constructor(
		@InjectRepository(UserSubscription)
		repository: Repository<UserSubscription>) {

		super(repository);
	}

	async findAllWithRelations(): Promise<UserSubscription[]> {
		return await this.repository.find({
			relations: ['user', 'subscription'],
		});
	}

	async findByUserId(userId: number): Promise<UserSubscription> {
		return await this.repository.findOne({
			where: { user: { id: userId } },
			relations: ['user', 'subscription'],
		});
	}

	async findTrialSubscriptionsByUserId(userId: number): Promise<UserSubscription> {
		// const currentDate = new Date();
		// const currentDateOnly = currentDate.toISOString().split('T')[0];
		return this.repository
			.createQueryBuilder('user_subscription')
			.innerJoinAndSelect('user_subscription.subscription', 'subscription')
			.innerJoinAndSelect('user_subscription.user', 'user')
			// .andWhere("DATE(user_subscription.start_Date) <= :currentDate", { currentDate: currentDateOnly })
			// .andWhere("DATE(user_subscription.end_Date) >= :currentDate", { currentDate: currentDateOnly })
			// .andWhere('subscription.planName = :planName', { planName: SUBSCRIPTION_PLANS.TRIAL })
			.andWhere('user_subscription.status = :status', { status: UserSubscriptionStatusType.TRIAL })
			.andWhere('user_subscription.user_id = :user_id', { user_id: userId })
			.getOne();
	}

	async findAllActiveSubscriptions(): Promise<UserSubscription[]> {
		const currentDate = new Date();
		const currentDateOnly = currentDate.toISOString().split('T')[0];
		return this.repository
			.createQueryBuilder('user_subscription')
			.innerJoinAndSelect('user_subscription.subscription', 'subscription')
			.innerJoinAndSelect('user_subscription.user', 'user')
			.andWhere('user_subscription.status = :status', { status: UserSubscriptionStatusType.ACTIVE })
			.andWhere("DATE(user_subscription.start_Date) <= :currentDate", { currentDate: currentDateOnly })
			.andWhere("DATE(user_subscription.end_Date) >= :currentDate", { currentDate: currentDateOnly })
			.andWhere('subscription.planName != :trialPlan', { trialPlan: SUBSCRIPTION_PLANS.TRIAL })
			.getMany();
	}

	async findUserSubscription(userId: number): Promise<UserSubscription> {

		const subscription = this.repository.findOne({
			where: {
				user: { id: userId },
			},
		});
		return subscription || null;
	}

	async findUserActiveSubscription(userId: number, stripeSubscriptionId: string): Promise<UserSubscription> {
		return this.repository.findOne({
			where: {
				user: { id: userId },
				status: In([UserSubscriptionStatusType.ACTIVE, UserSubscriptionStatusType.TRIAL]),
				stripe_subscription_id: stripeSubscriptionId,
			},
			// where:
			//   [
			//     { user: { id: userId }, status: UserSubscriptionStatusType.ACTIVE },
			//     { user: { id: userId }, status: UserSubscriptionStatusType.TRIAL }
			//   ],
			// status: UserSubscriptionStatusType.ACTIVE || UserSubscriptionStatusType.TRIAL,
		});
	}

	async findUserCurrentActiveSubscription(userId: number, subscriptionCancelledId: string): Promise<UserSubscription> {
		return this.repository.findOne({
			where: {
				user: { id: userId },
				stripe_subscription_id: subscriptionCancelledId,
				status: UserSubscriptionStatusType.ACTIVE,
			}
		});
	}

	// Get all subscription that expire before 3 days
	async getAllExpiringSubscription(): Promise<UserSubscription[]> {
		return this.repository.find({
			relations: ['user', 'subscription'],
			where: {
				// UserSubscriptionStatusType.CANCELLED,
				status: In([UserSubscriptionStatusType.ACTIVE, UserSubscriptionStatusType.TRIAL, UserSubscriptionStatusType.CANCELLED]),
				end_Date: Raw(
					(alias) => `DATE(${alias}) + INTERVAL '3 days' = CURRENT_DATE`
				),
			}
		});
	}

	async findMaxCycle(userId: number): Promise<number | null> {
		const result = await this.repository.findOne({
			relations: ['user'],
			where: {
				user: { id: userId },
			},
			order: {
				cycle: 'DESC', // Order by cycle in descending order
			},
			select: ['id', 'cycle'], // Include 'id' in the select clause for ordering
		});

		return result ? result.cycle : null; // Return the cycle number or null if not found
	}

	async findUserActiveSubscriptionWithoutSubscriptionId(userId: number): Promise<UserSubscription> {

		const subscription = this.repository.findOne({
			relations: ['subscription', 'user'],
			where: {
				user: { id: userId },
				status: In([UserSubscriptionStatusType.ACTIVE, UserSubscriptionStatusType.TRIAL])
			},
			
		});
		return subscription;
	}

	async findExpiredSubscriptionByUserId(userId: number): Promise<UserSubscription> {

		const subscription = this.repository.findOne({
			relations: ['subscription', 'user'],
			where: {
				user: { id: userId },
				status: In([UserSubscriptionStatusType.EXPIRED, UserSubscriptionStatusType.CANCELLED])
			},
		});
		return subscription;
	}
}