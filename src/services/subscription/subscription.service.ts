import { Injectable } from '@nestjs/common';
import { UserCredit } from 'src/entities/user_credit.entity';
import { UserSubscription } from 'src/entities/user_subscription.entity';
import { UserCreditRepository } from 'src/repositories/user-credit-repository';
import { UserSubscriptionRepository } from 'src/repositories/user-subscription-repository';
import { Subscription } from 'src/entities/subscriptions.entity';
import { User } from 'src/entities/user.entity';
import { SubscriptionRepository } from 'src/repositories/subscription-repository';
import { UserRepository } from 'src/repositories/userRepository';
import { UserCreditStatusType } from 'src/shared/constants/user-credit-status-constants';
import { planType, UserSubscriptionStatusType } from 'src/shared/constants/user-subscription-status-constants';
import { generateId, IdType } from 'src/shared/utils/generate-id.util';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import Stripe from 'stripe';
import { EMAIL_SEND, EMAIL_SEND_FILE } from 'src/shared/constants/email-notification-constants';
import { EmailService } from '../email/email.service';
import * as moment from 'moment';
import { NotificationMessage, NotificationType } from 'src/shared/constants/notification-constants';
import { NotificationService } from '../notification/notification.service';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { EmailTemplateDataDto } from 'src/dtos/params/email-template-dto';
import { SocialMediaAccountService } from '../social-media-account/social-media-account.service';
import { AwsSecretsService } from '../aws-secrets/aws-secrets.service';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';
import { ConfigService } from '@nestjs/config';
import { GeneratePostService } from '../generate-post/generate-post.service';
import { UserService } from '../user/user.service';

// import { CreatePostDto } from 'src/dtos/params/post-dto';
// import { CreatePostTaskDto } from 'src/dtos/params/post-task-dto';

@Injectable()
export class SubscriptionService {
	private stripe: Stripe;
	public platformName: string;
	private stripeSecretKey: string;
	private stripeWebhookSecret: string;
	constructor(
		private readonly unitOfWork: UnitOfWork,
		private readonly notificationService: NotificationService,
		private readonly emailService: EmailService,
		private readonly socialMediaAccountService: SocialMediaAccountService,
		private readonly secretService: AwsSecretsService,
		private configService: ConfigService,
		private readonly userService: UserService,
		private generatePostService: GeneratePostService,
		private userCreditRepository: UserCreditRepository,

		// private readonly checkSubscriptionSchedulerService: CheckSubscriptionSchedulerService,
	) {
		this.initialize();
	}
	private async initialize() {
		const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
		this.stripeSecretKey = secretData.STRIPE_SECRET_KEY;
		this.stripeWebhookSecret = secretData.STRIPE_WEBHOOK_SECRET;
		this.stripe = new Stripe(this.stripeSecretKey, {
			apiVersion: '2025-01-27.acacia'
			// apiVersion: '2024-12-18.acacia'
		});
	}

	async GeneratePostOnTrialPeriod(userSubscription: UserSubscription, userCredit: UserCredit): Promise<void> {
		try {
			// await this.unitOfWork.startTransaction();

			// get user subscription details 
			const userSubscriptionRepository = this.unitOfWork.getRepository(UserSubscriptionRepository, UserSubscription, true);
			const userSubscriptionDetails = await userSubscriptionRepository.findTrialSubscriptionsByUserId(userSubscription.user.id);
			if (userSubscriptionDetails) {
				// get user credit details
				const userCreditRepository = this.unitOfWork.getRepository(UserCreditRepository, UserCredit, true);
				// const userCreditDetails = await userCreditRepository.findTrialCreditByUserId(userSubscription.user.id, userSubscriptionDetails.subscription.id);
				// if (userCreditDetails) {

				// TODO: Generate Post
				// await this.createPostForSubscription(
				// 	userSubscriptionDetails.user.id,
				// 	userCredit.social_media_id,
				// 	userCredit.social_media_id,
				// 	userSubscriptionDetails.id
				// );
				// Minus credit amount based on each social media post creation
				userCredit.last_trigger_date = new Date();
				userCredit.current_credit_amount = userCredit.current_credit_amount - 1;
				await userCreditRepository.update(userCredit.id, userCredit);
				// }
			}
			// await this.unitOfWork.completeTransaction();
		}
		catch (error) {
			// await this.unitOfWork.rollbackTransaction();
			throw error;
		}
	}

	async GeneratePostSubscriptionWiseOnFirstCycle(): Promise<void> {
		console.log("GeneratePostSubscriptionWiseOnFirstCycle::: started")
		try {
			// Get all active user subscriptions for the first cycle
			const userCreditDetails = await this.userCreditRepository.getAllUserToGeneratePost();
			console.log("GeneratePostSubscriptionWiseOnFirstCycle::: userCreditDetails: ", userCreditDetails);


			if (userCreditDetails && userCreditDetails.length > 0) {
				// Iterate over user credits and generate posts
				await this.generatePostService.generatePostByAIAPI(userCreditDetails);
			}

		} catch (error) {
			console.log("GeneratePostSubscriptionWiseOnFirstCycle::: error: ", error);
			throw error;
		}
	}

	async cancelUserSubscription(userId: number, subscriptionCancelled: Stripe.Subscription) {
		try {
			await this.unitOfWork.startTransaction();

			const userSubscriptionRepository = this.unitOfWork.getRepository(
				UserSubscriptionRepository,
				UserSubscription,
				true,
			);

			const userSubscription = await userSubscriptionRepository.findUserCurrentActiveSubscription(
				userId,
				subscriptionCancelled.id
			);
			if (userSubscription) {
				userSubscription.status = UserSubscriptionStatusType.CANCELLED;
				await userSubscriptionRepository.update(
					userSubscription.id,
					userSubscription,
				);

				const userCreditRepository = this.unitOfWork.getRepository(
					UserCreditRepository,
					UserCredit,
					true,
				);
				await userCreditRepository.updateUserCreditsStatus(userSubscription.user.id);

				await this.unitOfWork.completeTransaction();

			}
			else {
				await this.unitOfWork.rollbackTransaction();
				throw ('User doen not have any active subscription.')
			}

		}
		catch (error) {
			await this.unitOfWork.rollbackTransaction();
			throw error;
		}
	}

	//create user trial subscription instance 	
	private async createUserTrialSubscription(
		user: User,
		subscription: Subscription,
		stripeSubscription: Stripe.Subscription
	): Promise<UserSubscription> {
		const userSubscription = new UserSubscription();
		userSubscription.id = generateId(IdType.USER_SUBSCRIPTION);
		userSubscription.subscription = subscription;
		userSubscription.user = user;
		userSubscription.stripe_subscription_id = stripeSubscription.id;
		userSubscription.status = UserSubscriptionStatusType.TRIAL;
		userSubscription.cycle = 0;
		userSubscription.start_Date = new Date();
		userSubscription.end_Date = new Date(
			new Date().setDate(new Date().getDate() + 7),
		);
		return userSubscription;
	}

	//create user subscription instance 	
	private async createUserSubscription(
		user: User,
		subscriptionPlan: Subscription,
		invoice?: Stripe.Invoice,
		stripeSubscription?: Stripe.Subscription
	): Promise<UserSubscription> {

		const userSubscriptionRepository = this.unitOfWork.getRepository(UserSubscriptionRepository, UserSubscription, false);

		const userSubscription = new UserSubscription();
		userSubscription.id = generateId(IdType.USER_SUBSCRIPTION);
		userSubscription.subscription = subscriptionPlan;

		userSubscription.user = user;
		userSubscription.stripe_subscription_id = stripeSubscription.id;
		userSubscription.status = (invoice.status == 'paid') ? UserSubscriptionStatusType.ACTIVE : UserSubscriptionStatusType.FAILED;
		userSubscription.start_Date = moment.unix(stripeSubscription.current_period_start).toDate();
		userSubscription.end_Date = moment.unix(stripeSubscription.current_period_end).toDate();

		userSubscription.cycle = await userSubscriptionRepository.findMaxCycle(user.id) + 1;

		return userSubscription;
	}

	//update user subscription 	
	private async UpdateUserSubscription(
		user: User,
		updatedSubscription: Stripe.Subscription,
		subscription: Subscription
	) {

		try {
			await this.unitOfWork.startTransaction();

			const userSubscriptionRepository = this.unitOfWork.getRepository(UserSubscriptionRepository, UserSubscription, true);

			//Get active user subscription
			const userCurrentSubscription = await userSubscriptionRepository.findUserActiveSubscription(user.id, updatedSubscription.id);

			if (userCurrentSubscription) {
				//update old subscription status
				userCurrentSubscription.status = UserSubscriptionStatusType.UPGRADED;
				await userSubscriptionRepository.update(userCurrentSubscription.id, userCurrentSubscription);
			}

			// create new subscription
			const userSubscription = new UserSubscription();
			userSubscription.id = generateId(IdType.USER_SUBSCRIPTION);

			userSubscription.subscription = subscription;
			userSubscription.user = user;
			userSubscription.stripe_subscription_id = updatedSubscription.id;
			userSubscription.status = UserSubscriptionStatusType.ACTIVE;
			userSubscription.start_Date = moment.unix(updatedSubscription.current_period_start).toDate();
			userSubscription.end_Date = moment.unix(updatedSubscription.current_period_end).toDate();
			userSubscription.cycle = userCurrentSubscription.cycle + 1;

			await userSubscriptionRepository.create(userSubscription);

			//call functionto save credit 
			await this.createUserCredit(
				user,
				subscription,
				userSubscription,
			);
			await this.unitOfWork.completeTransaction();
		} catch (error) {
			await this.unitOfWork.rollbackTransaction();
			throw error;
		}

	}

	//create user credit instance
	private async createUserTrialCredit(
		user: User,
		subscription: Subscription,
		userSubscription: UserSubscription,
		socialMediaAccountId?: number
	): Promise<UserCredit> {
		const userCredit = new UserCredit();
		userCredit.id = generateId(IdType.USER_SUBSCRIPTION_CREDIT);
		userCredit.user = user;
		userCredit.subscription = subscription;
		userCredit.current_credit_amount = subscription.creditAmount;
		userCredit.start_Date = new Date(
			new Date().setDate(new Date(userSubscription.start_Date).getDate() + 2),
		);
		userCredit.end_Date = new Date(
			new Date().setDate(new Date(userSubscription.start_Date).getDate() + 7),
		);
		userCredit.social_media_id = socialMediaAccountId;
		// userCredit.start_Date = userSubscription.start_Date;
		// userCredit.end_Date = userSubscription.end_Date;
		userCredit.status = UserCreditStatusType.ACTIVE;
		userCredit.cancel_Date = null;
		return userCredit;
	}

	//save user credit
	private async createUserCredit(
		user: User,
		subscription: Subscription,
		userSubscription: UserSubscription,
		socialMediaAccountId?: number
	): Promise<void> {

		const userCreditRepository = this.unitOfWork.getRepository(
			UserCreditRepository,
			UserCredit,
			true
		);

		if (!socialMediaAccountId) {
			//expire old credit
			await userCreditRepository.updateUserCreditsToExpired(user.id);
			const socialMediaAccountRepository = this.unitOfWork.getRepository(
				SocialMediaAccountRepository,
				SocialMediaAccount,
				true
			);

			//find user connected social media accounts 
			const userPlatforms = await socialMediaAccountRepository.findPlatformsOfUser(user.id);

			// Create an array of UserCredit instances and generate post

			const userCredits = await Promise.all(
				userPlatforms.map(async (userPlatform) => {
					const creditInstance = this.createUserCreditInstance(user, subscription, userSubscription, userPlatform.id);
					// await this.GenerateUserPostSubscriptionWise(user, subscription, userSubscription, userPlatform.id);
					return creditInstance;
				})
			);


			// userPlatforms is an array of objects with a 'platform' property
			const platforms = userPlatforms.map(userPlatform => userPlatform.platform);

			// Join platforms with a comma and add "and" before the last platform
			const formattedPlatforms = platforms.length > 1
				? platforms.slice(0, -1).join(', ') + ' and ' + platforms[platforms.length - 1]
				: platforms[0]; // If there's only one platform, just return it


			// Save all UserCredit instances at once
			await userCreditRepository.save(userCredits);
			if (userSubscription.cycle == 1) {
				await this.generatePostService.generatePostByAIAPI(userCredits);
			}


			await this.notificationService.saveData(userSubscription.user.id, NotificationType.SOCIAL_CREDIT_ADDED, `${NotificationMessage[NotificationType.SOCIAL_CREDIT_ADDED]} ${formattedPlatforms}`);
			//Generate posts
			// await Promise.all(
			// 	userPlatforms.map((userPlatform) =>
			// 		this.GenerateUserPostSubscriptionWise(user, subscription, userSubscription, userPlatform.id)
			// 	)
			// );

		} else {

			// Create UserCredit instances
			const userCredit = this.createUserCreditInstance(
				user,
				subscription,
				userSubscription,
				socialMediaAccountId
			);
			// this.GenerateUserPostSubscriptionWise(user, subscription, userSubscription, socialMediaAccountId);
			await userCreditRepository.create(userCredit);
			if (userSubscription.cycle == 1) {
				{
					await this.generatePostService.generatePostByAIAPI([userCredit]);
				}

				// Save the single UserCredit instance
			}
		}
	}

	/**
	* Helper function to create a UserCredit instance.
	*/
	private createUserCreditInstance(
		user: User,
		subscription: Subscription,
		userSubscription: UserSubscription,
		socialMediaAccountId: number
	): UserCredit {
		const userCredit = new UserCredit();
		userCredit.id = generateId(IdType.USER_SUBSCRIPTION_CREDIT);
		userCredit.user = user;
		userCredit.subscription = subscription;
		userCredit.current_credit_amount =
			userSubscription.cycle === 1
				? subscription.creditAmount * 2
				: subscription.creditAmount;
		// Add 3 days to start_Date
		// userCredit.start_Date = new Date(
		// 	new Date(userSubscription.start_Date).setDate(
		// 		new Date(userSubscription.start_Date).getDate() + 3
		// 	)
		// );
		// // Add 3 days to end_Date
		// userCredit.end_Date = new Date(
		// 	new Date(userSubscription.end_Date).setDate(
		// 		new Date(userSubscription.end_Date).getDate() + 3
		// 	)
		// );

		// Add 3 days to today's date for start_Date
		// userCredit.start_Date = new Date();
		userCredit.start_Date = new Date(userSubscription.start_Date);
		userCredit.start_Date.setDate(userCredit.start_Date.getDate() + 3);

		// Add 1 month and 3 days to today's date for end_Date
		// userCredit.end_Date = new Date();
		userCredit.end_Date = new Date(userSubscription.start_Date);
		userCredit.end_Date.setMonth(userCredit.end_Date.getMonth() + 1);
		userCredit.end_Date.setDate(userCredit.end_Date.getDate() + 3);
		userCredit.cancel_Date = null;

		userCredit.social_media_id = socialMediaAccountId;

		userCredit.status = UserCreditStatusType.ACTIVE;
		userCredit.last_trigger_date = new Date();
		return userCredit;
	}

	async checkUserHasSubscription(userId: number) {
		const userSubscriptionRepository = this.unitOfWork.getRepository(
			UserSubscriptionRepository,
			UserSubscription,
			false,
		);

		//Check user have already subscription or not
		const existingSubscription = await userSubscriptionRepository.findUserSubscription(userId);

		return existingSubscription !== null; // Returns true if a subscription exists, false otherwise

	}

	async saveUserTrialSubscription(userId: number) {
		try {
			await this.unitOfWork.startTransaction();

			const userRepository = this.unitOfWork.getRepository(
				UserRepository,
				User,
				true,
			);

			const user = await userRepository.findOne(userId);

			//Create customer in stripe
			if (!user.stripeCustomerId) {
				const stripeCustomer = await this.createOrFetchStripeCustomer(user);
				user.stripeCustomerId = stripeCustomer.id;
			}

			// Save the Stripe customer ID to the user record
			await userRepository.update(user.id, user);

			const subscriptionRepository = this.unitOfWork.getRepository(
				SubscriptionRepository,
				Subscription,
				false,
			);

			const subscription = await subscriptionRepository.findSubscriptionByName(
				planType.STARTER_PACKAGE,
			);

			//create subscription in stripe
			const stripeSubscription = await this.stripe.subscriptions.create({
				customer: user.stripeCustomerId,
				items: [{ price: subscription.stripePriceId }], // Replace with your trial price ID
				// items: [{ price: 'price_1QaH70DeQp3ZMZcw42IeHkSt' }], // Replace with your trial price ID
				// trial_period_days: 3,
				trial_period_days: 7,
				payment_behavior: 'default_incomplete', // Ensure the subscription waits for payment completion
				expand: ['latest_invoice.payment_intent'], // Optional: Include payment intent details
			});

			if (!stripeSubscription) {
				throw new Error('Failed to create a trial subscription in Stripe.');
			}
			await this.unitOfWork.completeTransaction();

		} catch (error) {
			await this.unitOfWork.rollbackTransaction();
			throw error;
		}
	}

	//save user subscription for trial
	async saveSubAndCredit(user: User, stripeSubscription: Stripe.Subscription) {
		try {

			await this.unitOfWork.startTransaction();

			const userSubscriptionRepository = this.unitOfWork.getRepository(
				UserSubscriptionRepository,
				UserSubscription,
				true,
			);

			const subscriptionRepository = this.unitOfWork.getRepository(
				SubscriptionRepository,
				Subscription,
				false,
			);

			//Get Trial plan
			const subscriptionTrial = await subscriptionRepository.findSubscriptionByName(
				planType.TRIAL,
			);

			if (stripeSubscription) {
				// Step 2: Create a Subscription with a Trial
				const userSubscription = await this.createUserTrialSubscription(
					user,
					subscriptionTrial,
					stripeSubscription
				);

				await userSubscriptionRepository.create(userSubscription);
				await this.notificationService.saveData(user.id, NotificationType.TRIAL_SUBSCRIPTION_STARTED, NotificationMessage[NotificationType.TRIAL_SUBSCRIPTION_STARTED]);
			}
			else {
				//to-do:
				//what we need to do if stripe subscription is not created?
				await this.notificationService.saveData(user.id, NotificationType.TRIAL_SUBSCRIPTION_FAILED, NotificationMessage[NotificationType.TRIAL_SUBSCRIPTION_FAILED]);
			}
			await this.unitOfWork.completeTransaction();

		} catch (error) {
			await this.unitOfWork.rollbackTransaction();
			throw error;
		}

	}

	//stripe customer create & fetch
	async createOrFetchStripeCustomer(user: User) {
		const existingCustomers = await this.stripe.customers.list({ email: user.email, limit: 1 });

		if (existingCustomers.data.length > 0) {
			return existingCustomers.data[0];
		}

		return this.stripe.customers.create({
			name: user.name,
			email: user.email,
			metadata: { userId: user.id.toString() },
		});
	}

	// Save user subscription & credit
	async saveUserSubscription(user: User, subscription: Subscription, invoice?: Stripe.Invoice, stripeSubscription?: Stripe.Subscription) {
		try {
			await this.unitOfWork.startTransaction();
			const userSubscriptionRepository = this.unitOfWork.getRepository(
				UserSubscriptionRepository,
				UserSubscription,
				true,
			);

			const userSubscription = await userSubscriptionRepository.findUserActiveSubscription(
				user.id,
				stripeSubscription.id
			);

			//Inavtive existing subscription
			if (userSubscription) {
				userSubscription.status = UserSubscriptionStatusType.INACTIVE;
				await userSubscriptionRepository.update(
					userSubscription.id,
					userSubscription,
				);
			}

			const userSubscriptionCreate = await this.createUserSubscription(
				user,
				subscription,
				invoice,
				stripeSubscription
			);

			await userSubscriptionRepository.create(userSubscriptionCreate);


			await this.createUserCredit(
				user,
				subscription,
				userSubscriptionCreate,
			);

			await this.unitOfWork.completeTransaction();
		} catch (error) {
			await this.unitOfWork.rollbackTransaction();
			throw error;
		}
	}



	async generateCustomerPortalLink(
		userId: number,
	): Promise<Stripe.BillingPortal.Session> {

		const user = await this.userService.findOne(userId);

		if (user.stripeCustomerId != null) {
			const appUrl = this.configService.get<string>('APP_URL_FRONTEND');
			return this.stripe.billingPortal.sessions.create({
				customer: user.stripeCustomerId,
				return_url: `${appUrl}/user/dashboard`,
			});
		}
		return null;
	}

	async processWebhook(req: any): Promise<void> {
		const sig = req.headers['stripe-signature'];
		let event: Stripe.Event;

		try {
			event = this.stripe.webhooks.constructEvent(
				req.body,
				sig,
				this.stripeWebhookSecret,
			);
		} catch (err) {
			throw new Error(`Invalid webhook signature: ${err.message}`);
		} // Handle different event types
		switch (event.type) {
			case 'customer.subscription.trial_will_end':
				//3 days before trial expire
				const userRepository = this.unitOfWork.getRepository(
					UserRepository,
					User,
					false,
				);
				const subscription = event.data.object as Stripe.Subscription;
				const stripeCustomerId = subscription.customer as string;

				//Get user by stripe customer ID
				const user = await userRepository.findByField('stripeCustomerId', stripeCustomerId);

				//Create customer portal link
				const customerPortalLink = await this.generateCustomerPortalLink(user.id);

				const emailData: EmailTemplateDataDto = {
					userName: user.name,
					userEmail: user.email,
					trialEndDate: new Date(subscription.current_period_end),
					customerPortalLink: customerPortalLink.url,
				};

				const html = await this.emailService.loadTemplateWithData(EMAIL_SEND_FILE[EMAIL_SEND.TRIAL_EXPIRING_SOON], emailData);

				await this.emailService.sendEmail(user.email, EMAIL_SEND.TRIAL_EXPIRING_SOON, html);
				console.log(customerPortalLink.url, 'customerPortalLinkURL')
				break;

			case 'customer.subscription.updated': // Handle subscription updates
				const updatedSubscription = event.data.object as Stripe.Subscription;
				if (updatedSubscription.cancel_at_period_end) {
					const userRepository = this.unitOfWork.getRepository(
						UserRepository,
						User,
						false,
					);
					const customerId = updatedSubscription.customer;

					const existingUser = await userRepository.findByField('stripeCustomerId', customerId);

					// The subscription is set to cancel at the end of the billing period
					await this.cancelUserSubscription(existingUser.id, updatedSubscription);
				}
				break;

			case 'invoice.payment_succeeded':
				try {

					const userRepository = this.unitOfWork.getRepository(
						UserRepository,
						User,
						false,
					);
					//stripe invoice object
					const invoicePaid = event.data.object as Stripe.Invoice;
					// The  customer ID
					const customerId = invoicePaid.customer;
					//Get user by stripe customer ID

					let existingUser;
					try {
						existingUser = await userRepository.findByField('stripeCustomerId', customerId);
					} catch (findUserError) {
						console.error('Error fetching user by Stripe customer ID:', findUserError);
						throw new Error('Failed to retrieve user.'); // Re-throw to propagate the error
					}
					// const existingUser = await userRepository.findByField('stripeCustomerId', customerId);

					//stripe subscription object
					const stripeSubscription = await this.stripe.subscriptions.retrieve(
						typeof invoicePaid.subscription === 'string'
							? invoicePaid.subscription
							: invoicePaid.subscription.id,
					);
					if (stripeSubscription.trial_end && invoicePaid.total == 0) {
						await this.saveSubAndCredit(existingUser, stripeSubscription);

						//find user SocialMediaAccount Without Active Credit
						const socialMediaAccount = await this.socialMediaAccountService.findFirstSocialMediaAccountWithoutActiveCredit(existingUser.id);

						//save user credit for trial
						await this.findByUserAndPlatformAndSaveCredit(existingUser.id, socialMediaAccount);
					}
					else {
						const subscriptionRepository = this.unitOfWork.getRepository(
							SubscriptionRepository,
							Subscription,
							false,
						);

						const subscription = await subscriptionRepository.findSubscriptionByName(
							planType.STARTER_PACKAGE,
						);
						//Fetch subscription using price id
						// const subscription = await subscriptionRepository.findSubscriptionByPriceId(stripeSubscription.items.data[0].price.id);

						//subscription for first time or recurring
						if (invoicePaid.billing_reason == 'subscription_create' || invoicePaid.billing_reason == 'subscription_cycle') {
							await this.saveUserSubscription(existingUser, subscription, invoicePaid, stripeSubscription);
						}
						else if (invoicePaid.billing_reason == 'subscription_update') {
							await this.UpdateUserSubscription(existingUser, stripeSubscription, subscription);
						}
						else {

						}
					}

					// invoicePaid.total != 0 && 

				} catch (error) {
					console.log(error, 'errro in stripe');
					throw error;
				}
				break;
			default:

		}
	}


	async checkAndExpireSubscriptions(): Promise<{ userId: number; endDate: Date; subscription: string, cycle: number }[]> {
		try {
			await this.unitOfWork.startTransaction();

			const userSubscriptionRepository = this.unitOfWork.getRepository(
				UserSubscriptionRepository,
				UserSubscription,
				true,
			);

			const userCreditRepository = this.unitOfWork.getRepository(
				UserCreditRepository,
				UserCredit,
				true,
			);

			const userSubscriptions = await userSubscriptionRepository.getAllExpiringSubscription();
			// const expiredUserIds: number[] = []; // Array to store user IDs
			const expiredSubscriptions: { userId: number; endDate: Date; subscription: any, cycle: number }[] = []; // Array to store user details

			//expire subscription of users
			for (const userSubscription of userSubscriptions) {
				userSubscription.status = UserSubscriptionStatusType.EXPIRED;
				await userSubscriptionRepository.update(
					userSubscription.id,
					userSubscription,
				);

				// expire active credits
				await userCreditRepository.updateUserCreditsStatus(userSubscription.user.id);

				// add cancelled plan notification 
				await this.notificationService.saveData(userSubscription.user.id, NotificationType.SUBSCRIPTION_CANCELLED, NotificationMessage[NotificationType.SUBSCRIPTION_CANCELLED]);

				expiredSubscriptions.push({
					userId: userSubscription.user.id,
					endDate: userSubscription.end_Date,
					subscription: userSubscription.id,
					cycle: userSubscription.cycle
				});
			}
			await this.unitOfWork.completeTransaction();
			return expiredSubscriptions;
		} catch (error) {
			await this.unitOfWork.rollbackTransaction();
			throw error;
		}
	}

	async findByUserAndPlatformAndSaveCredit(userId: number, platform: string) {

		try {
			const socialMediaAccountRepository = this.unitOfWork.getRepository(
				SocialMediaAccountRepository,
				SocialMediaAccount,
				false,
			);

			const userSubscriptionRepository = this.unitOfWork.getRepository(
				UserSubscriptionRepository,
				UserSubscription,
				false,
			);

			const userSubscriptionCreditRepository = this.unitOfWork.getRepository(
				UserCreditRepository,
				UserCredit,
				false,
			);

			//find social media acc. from platform
			const userSocialAcc = await socialMediaAccountRepository.findByUserAndPlatform(userId, platform);

			//find user credit for social media acc.
			const userCredit = await userSubscriptionCreditRepository.getUserCreditWithSocialMedia(userId, userSocialAcc.id);

			//Find user active subsctiption
			const userSubscription = await userSubscriptionRepository.findUserActiveSubscriptionWithoutSubscriptionId(userId);

			if (!userCredit && userSubscription) {

				const subscriptionRepository = this.unitOfWork.getRepository(
					SubscriptionRepository,
					Subscription,
					false,
				);
				const subscription = await subscriptionRepository.findOne(userSubscription.subscription.id)

				await this.unitOfWork.startTransaction();
				let userCredit: UserCredit;
				//Create user credit
				if (userSubscription.cycle == 0) {
					const userCreditRepository = this.unitOfWork.getRepository(
						UserCreditRepository,
						UserCredit,
						true,
					);
					userCredit = await this.createUserTrialCredit(userSubscription.user, subscription, userSubscription, userSocialAcc.id);
					await userCreditRepository.create(userCredit);
					this.generatePostService.generatePostByAIAPI([userCredit]);
					// await this.GeneratePostOnTrialPeriod(userSubscription, userCredit);

				}
				else {
					await this.createUserCredit(userSubscription.user, subscription, userSubscription, userSocialAcc.id);
				}
				//Generate posts
				await this.notificationService.saveData(userSubscription.user.id, NotificationType.SOCIAL_CREDIT_ADDED, `${NotificationMessage[NotificationType.SOCIAL_CREDIT_ADDED]} ${userSocialAcc.platform}`);

				await this.unitOfWork.completeTransaction();
			}

		} catch (error) {
			await this.unitOfWork.rollbackTransaction();
			throw error;
		}
	}
}
