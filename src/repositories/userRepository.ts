import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { QUESTIONNAIRE } from 'src/shared/constants/quessanaire-constants';
import { UserAnswersWithQuestionsAndSocialMediaDTO } from 'src/dtos/response/UserAnswersWithQuestionsAndSocialMediaDto .dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSubscriptionStatusType } from 'src/shared/constants/user-subscription-status-constants';

@Injectable()
export class UserRepository extends GenericRepository<User> {
	constructor(
		@InjectRepository(User)
		repository: Repository<User>,
	) {
		super(repository);
	}

	async findsocialProfiles(userId: number): Promise<SocialMediaAccount[]> {
		// Query only the SocialMediaAccount entities associated with the given userId
		return this.repository.manager
			.createQueryBuilder(SocialMediaAccount, 'socialMediaAccount')
			.select([
				'socialMediaAccount.platform',
				'socialMediaAccount.encrypted_access_token',
			])
			.where('socialMediaAccount.user_id = :userId', { userId })
			.getMany();
	}

	async findBySocialMediaId(socialMediaId: string): Promise<User | null> {
		return await this.repository.findOne({
			where: { socialMediaId: socialMediaId },
		});
	}

	// async findUserAnswersWithQuestionsAndSocialMedia(
	// 	userId: number,
	// 	socialMediaId: number
	// ): Promise<UserAnswersWithQuestionsAndSocialMediaDTO> {
	// 	const user = await this.repository
	// 		.createQueryBuilder('user')
	// 		.leftJoinAndSelect('user.userSubscriptions', 'userSubscription')
	// 		.leftJoinAndSelect('user.socialMediaAccounts', 'socialMediaAccount')
	// 		.leftJoinAndSelect('user.userBusiness', 'userBusiness')
	// 		.leftJoinAndSelect('user.userAnswers', 'userAnswer')
	// 		.leftJoinAndSelect('userAnswer.question', 'question')
	// 		.leftJoinAndSelect('question.options', 'options')
	// 		.leftJoinAndSelect('userAnswer.question_option', 'options')
	// 		.leftJoinAndSelect('question.questionnaire', 'questionnaire')
	// 		.where('user.id = :userId', { userId })
	// 		.andWhere('socialMediaAccount.id = :socialMediaId', { socialMediaId })
	// 		.andWhere('questionnaire.name = :name', { name: QUESTIONNAIRE.ONBOARDING })
	// 		.andWhere('socialMediaAccount.isDisconnect = :isDisconnect', { isDisconnect: false })
	// 		.andWhere('userSubscription.status IN (:...statuses)', { statuses: [UserSubscriptionStatusType.ACTIVE, UserSubscriptionStatusType.TRIAL] })
	// 		.select([
	// 			'user.id',
	// 			'user.name',
	// 			'socialMediaAccount.platform',
	// 			'userBusiness.id',
	// 			'userBusiness.brand_name',
	// 			'userBusiness.website',
	// 			'userBusiness.use',
	// 			'userAnswer.id',
	// 			'userAnswer.answer_text',
	// 			'question.id',
	// 			'question.question',
	// 			'userAnswer.question.options',
	// 			'question.question_type',
	// 			'question.question_name',
	// 			'userSubscription.id',
	// 			'userSubscription.start_Date',
	// 			'userSubscription.end_Date',
	// 			'userSubscription.cycle',
	// 		])
	// 		.getOne();

	// 	if (!user) {
	// 		throw new Error('User not found');
	// 	}

	// 	return {
	// 		userName: user.name,
	// 		socialMedia: {
	// 			platform: user.socialMediaAccounts[0]?.platform || null,
	// 			isDisconnect: user.socialMediaAccounts[0]?.isDisconnect || false,
	// 		},
	// 		userSubscription: {
	// 			id: user.userSubscriptions[0].id,
	// 			cycle: user.userSubscriptions[0].cycle,
	// 			end_Date: user.userSubscriptions[0].end_Date,
	// 			start_Date: user.userSubscriptions[0].start_Date,
	// 		},
	// 		userBusiness: user.userBusiness
	// 			? {
	// 				id: user.userBusiness.id,
	// 				brandName: user.userBusiness.brand_name,
	// 				website: user.userBusiness.website,
	// 				use: user.userBusiness.use,
	// 			}
	// 			: null,
	// 		userAnswers: user.userAnswers.map((answer: any) => ({
	// 			id: answer.id,
	// 			answerText: answer.answer_text || answer.question_option,
	// 			question: {
	// 				id: answer.question.id,
	// 				question: answer.question.question,
	// 				questionType: answer.question.question_type,
	// 				questionName: answer.question.question_name,
	// 			},
	// 		})),
	// 	};
	// }

	async findUserAnswersWithQuestionsAndSocialMedia(
		userId: number,
		socialMediaId: number
	): Promise<UserAnswersWithQuestionsAndSocialMediaDTO> {
		const user = await this.repository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.userSubscriptions', 'userSubscription')
			.leftJoinAndSelect('user.socialMediaAccounts', 'socialMediaAccount')
			.leftJoinAndSelect('user.userBusiness', 'userBusiness')
			.leftJoinAndSelect('user.userAnswers', 'userAnswer')
			.leftJoinAndSelect('userAnswer.question', 'question')
			.leftJoinAndSelect('question.options', 'options')
			.leftJoinAndSelect('userAnswer.question_option', 'questionOption')
			.leftJoinAndSelect('question.questionnaire', 'questionnaire')
			.where('user.id = :userId', { userId })
			.andWhere('socialMediaAccount.id = :socialMediaId', { socialMediaId })
			.andWhere('questionnaire.name = :name', { name: QUESTIONNAIRE.ONBOARDING })
			.andWhere('socialMediaAccount.isDisconnect = :isDisconnect', { isDisconnect: false })
			.andWhere('userSubscription.status IN (:...statuses)', { statuses: [UserSubscriptionStatusType.ACTIVE, UserSubscriptionStatusType.TRIAL] })
			.select([
				'user.id',
				'user.name',
				'socialMediaAccount.platform',
				'userBusiness.id',
				'userBusiness.brand_name',
				'userBusiness.website',
				'userBusiness.use',
				'userAnswer.id',
				'userAnswer.answer_text',
				'question.id',
				'question.question',
				'question.question_type',
				'question.question_name',
				'userAnswer.question_option',
				'userSubscription.id',
				'userSubscription.start_Date',
				'userSubscription.end_Date',
				'userSubscription.cycle',
			])
			.getOne();
	
		if (!user) {
			throw new Error('User not found');
		}
	
		return {
			userName: user.name,
			socialMedia: {
				platform: user.socialMediaAccounts[0]?.platform || null,
				isDisconnect: user.socialMediaAccounts[0]?.isDisconnect || false,
			},
			userSubscription: {
				id: user.userSubscriptions[0].id,
				cycle: user.userSubscriptions[0].cycle,
				end_Date: user.userSubscriptions[0].end_Date,
				start_Date: user.userSubscriptions[0].start_Date,
			},
			userBusiness: user.userBusiness
				? {
					id: user.userBusiness.id,
					brandName: user.userBusiness.brand_name,
					website: user.userBusiness.website,
					use: user.userBusiness.use,
				}
				: null,
			userAnswers: user.userAnswers.map((answer: any) => {
				const answerText = answer.answer_text || (answer.question_option ? answer.question_option.map((opt: any) => opt.option).join(', ') : '');
				return {
					id: answer.id,
					answerText,
					question: {
						id: answer.question.id,
						question: answer.question.question,
						questionType: answer.question.question_type,
						questionName: answer.question.question_name,
					},
				};
			}),
		};
	}
	


}
