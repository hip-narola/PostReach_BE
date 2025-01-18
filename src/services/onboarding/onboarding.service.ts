import { Injectable } from '@nestjs/common';

import { OnboardingRepository } from 'src/repositories/onboarding-repository';
import { UnitOfWork } from 'src/unitofwork/unitofwork';

@Injectable()
export class OnboardingService {
	constructor(
		private readonly onboardingRepository: OnboardingRepository,
		private readonly unitOfWork: UnitOfWork
	) {
	}
	async getData(): Promise<any> {
		const questions = await this.onboardingRepository.findQuestionsWithAnswers();

		// Group questions by step_id
		const groupedData = questions.reduce((acc, question) => {

			const stepId = question.step_id;

			if (!acc[stepId]) {
				acc[stepId] = {
					StepId: stepId,
					Questions: [],
				};
			}

			// Format each question and add to its respective step
			acc[stepId].Questions.push({
				id: question.id,
				Question: question.question,
				QuestionDescription: question.question_description,
				QuestionType: question.question_type,
				ControlLabel: question.control_label,
				ControlPlaceholder: question.control_placeholder,
				QuestionOrder: question.question_order,
				ReferenceId: question.reference_id,
				AnswerList: question.options?.map(answer => ({
					id: answer.id,
					QuestionId: answer.question_id,
					Name: answer.name,
					SubQuestionId: answer.sub_question_id,
				})),
			});

			return acc;
		}, {});
		// Return grouped data as an array of steps
		return Object.values(groupedData);
	}
}