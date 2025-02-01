import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/userRepository';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { UserDto } from 'src/dtos/params/user.dto';
import { ImageUploadService } from '../image-upload/image-upload.service';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { UserAnswerRepository } from 'src/repositories/user-answer-repository';
import { UserAnswer } from 'src/entities/user-answer.entity';
import { QuestionnaireRepository } from 'src/repositories/questionnaire-repository';
import { Questionnaire } from 'src/entities/questionnaire.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: UserRepository,
		private readonly unitOfWork: UnitOfWork,
		private readonly imageUploadService: ImageUploadService
	) { }

	// Method to find user by email
	async findUserByEmail(email: string): Promise<User | undefined> {
		try {
		const user = this.userRepository.findByEmail(email); 		
		console.log("USER : ", user);
		return user;
		} catch (err){
			console.log("ERR : ", err);
		}
	}

	// Method to update user password
	async updateUserPassword(user: User): Promise<void> {
		await this.unitOfWork.startTransaction();
		try {
			await this.userRepository.create(user);
			await this.unitOfWork.completeTransaction();
		} catch (error) {
			await this.unitOfWork.rollbackTransaction();
			throw error;
		}
	}

	// Method to update user details
	async updateUser(
		id: number,
		data: UserDto,
		file?: Express.Multer.File,
	): Promise<User> {
		await this.unitOfWork.startTransaction();
		try {
			const userRepository = this.unitOfWork.getRepository(
				UserRepository,
				User,
				true,
			);
			if (file) {
				const bucketName = 'user';
				const existingUser = await userRepository.findOne(id);
				if (existingUser.profilePictureUrl) {
					const oldFilePath = `${existingUser.profilePictureUrl}`; // Extracting the filename from URL
					await this.imageUploadService.deleteImage(bucketName, oldFilePath);
				}
				const folderName = `${id}/profile`;
				const { publicUrl: imageUrl, filePath } =
					await this.imageUploadService.uploadImage(
						bucketName,
						file,
						folderName,
					);
				data.profilePicture = imageUrl;
				data.profilePictureUrl = filePath;
			}

			data = Object.assign(
				new User(),
				Object.fromEntries(
					Object.entries(data).map(([key, value]) =>
						value === 'null' ? [key, null] : [key, value]
					)
				)
			);
			await userRepository.update(id, data);
			const updatedUser = await userRepository.findOne(id);
			await this.unitOfWork.completeTransaction();
			return updatedUser;
		} catch (error) {
			await this.unitOfWork.rollbackTransaction();
			throw error;
		}
	}

	// Method to find user by ID
	async findOne(id: number): Promise<User> {
		const userRepo = this.unitOfWork.getRepository(UserRepository, User, false);
		// Using a more explicit check for the existence of the user
		const user = await userRepo.findOne(id);
		if (!user) {
			throw new NotFoundException('User not found.');
		}
		return user;
	}
	async onboardingCompletedSteps(
		userId: number,
	): Promise<{ maxStep: number; onboardingCompleted: boolean }> {
		try {
			// Directly use the UserAnswerRepository from the unitOfWork or repository context
			const userAnswerRepository = this.unitOfWork.getRepository(
				UserAnswerRepository,
				UserAnswer,
				false,
			);

			if (!userAnswerRepository) {
				throw new Error('UserAnswerRepository not found');
			}

			// Fetch the user answers and eager load the `question` relation
			const userAnswers = await userAnswerRepository.findByFields({
				where: { user_id: userId },
				relations: ['question'], // Eager load the `question` relation
			});

			if (userAnswers.length === 0) {
				return { maxStep: -1, onboardingCompleted: false }; // No answers found for the user
			}

			// Filter answers where the question's questionnaire_id is 1
			const filteredAnswers = userAnswers.filter(
				(userAnswer) => userAnswer.question?.questionnaire_id === 1,
			);

			if (filteredAnswers.length === 0) {
				return { maxStep: -1, onboardingCompleted: false }; // No answers with questionnaire_id 1 found
			}

			// Find the maximum step_id the user has answered with questionnaire_id 1
			const userMaxStep = Math.max(
				...filteredAnswers.map((userAnswer) => userAnswer.question?.step_id),
			);

			// Use the QuestionnaireRepository to find the questionnaire with ID = 1 and get related questions
			const questionnaireRepository = this.unitOfWork.getRepository(
				QuestionnaireRepository,
				Questionnaire,
				false,
			);

			if (!questionnaireRepository) {
				throw new Error('QuestionnaireRepository not found');
			}

			const questionnaire = await questionnaireRepository.findOneByFields({
				where: { id: 1 }, // Find the questionnaire with ID = 1
				relations: ['questions'], // Eager load the `questions` relation
			});

			if (!questionnaire || !questionnaire.questions) {
				return { maxStep: -1, onboardingCompleted: false }; // No questions for questionnaire_id 1 found
			}

			// Find the maximum step_id among all questions of questionnaire_id 1
			const maxQuestionStep = Math.max(
				...questionnaire.questions.map((question) => question.step_id),
			);

			// Determine if the user has completed all onboarding steps for questionnaire_id 1
			const onboardingCompleted = userMaxStep >= maxQuestionStep;

			return {
				maxStep: userMaxStep,
				onboardingCompleted: onboardingCompleted,
			};
		} catch (error) {
			// Return -1 and false as a fallback value when an error occurs
			return { maxStep: -1, onboardingCompleted: false };
		}
	}

	async findUserProfileStatus(
		id: number,
	): Promise<{ socialMediaAccounts: SocialMediaAccount[] }> {
		const userRepo = this.unitOfWork.getRepository(UserRepository, User, false);

		try {
			// Find the user by ID
			const user = await userRepo.findOne(id);
			if (!user) {
				throw new NotFoundException('User not found.');
			}

			// Fetch social media accounts for the user
			const socialMediaAccounts = await userRepo.findsocialProfiles(id);
			return {
				socialMediaAccounts,
			};
		} catch (error) {
			// Return default response or rethrow the error
			throw error; // Propagate any errors up or handle as needed
		}
	}

	async profileStatus(id: number) {
		try {
			// Call findUserProfileStatus and handle its response
			const userProfileStatus = await this.findUserProfileStatus(id);

			// Call onboardingCompletedSteps and handle its response
			const onboardingStep = await this.onboardingCompletedSteps(id);

			// Combine both responses into one object
			return {
				userProfileStatus: {
					...userProfileStatus, // Spread the existing userProfileStatus properties
					maxStep: onboardingStep.maxStep,
					onboardingCompleted: onboardingStep.onboardingCompleted,
				},
			};
		} catch (error) {
			throw error;
		}
	}


	async findBySocialMediaId(socialMediaId: string): Promise<User | null> {
		try {

			await this.unitOfWork.startTransaction();

			const userRepository = this.unitOfWork.getRepository(
				UserRepository,
				User,
				false,
			);
			const data = userRepository.findBySocialMediaId(socialMediaId);

			await this.unitOfWork.completeTransaction();

			return data;
		}
		catch (error) {
			await this.unitOfWork.rollbackTransaction();

			throw error;
		}
	}

	async createUser(user: any, isFacebook: boolean = false): Promise<User> {
		if (isFacebook == false) {
			await this.unitOfWork.startTransaction();
		}
		try {
			const userRepository = this.unitOfWork.getRepository(
				UserRepository,
				User,
				true,
			);
			const data = await userRepository.create(user);
			if (isFacebook == false) {
				await this.unitOfWork.completeTransaction();
			}
			return data;
		}
		catch (error) {
			if (isFacebook == false) {
				await this.unitOfWork.rollbackTransaction();
			}
			throw error;
		}
	}
}
