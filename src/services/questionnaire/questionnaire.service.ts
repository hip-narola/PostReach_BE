import { Injectable, NotFoundException } from '@nestjs/common';
import { UserAnswer } from 'src/entities/user-answer.entity';
import { QuestionnaireRepository } from 'src/repositories/questionnaire-repository';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { UserAnswerRepository } from 'src/repositories/user-answer-repository';
import { In, Not } from 'typeorm';
import { Questionnaire } from 'src/entities/questionnaire.entity';
import { Question } from 'src/entities/question.entity';
import { UserBusinessRepository } from 'src/repositories/userBusinessRepository';
import { UserBusiness } from 'src/entities/user-business.entity';
import { UserQuestionRepository } from 'src/repositories/user-question-repository';
@Injectable()
export class QuestionnaireService {
    constructor(
        private readonly questionnaireRepository: QuestionnaireRepository,
        private readonly UserAnswerRepository: UserAnswerRepository,
        private readonly unitOfWork: UnitOfWork,
        private readonly userBusinessRepo: UserBusinessRepository,
        private readonly userQuestionRepository: UserQuestionRepository,
    ) { }

    private formatAnswers(answers): { question_option_id: string[], answer_text: string | null } {
        console.time('formatAnswers execution time');
        if (!answers || answers.length === 0) {
            return { question_option_id: [], answer_text: null };
        }

        const questionOptionIds = answers
            .map(ans => ans.question_option_id)
            .filter(id => id)  // Filter out any falsy values like null or empty strings
            .join(', ');
        console.timeEnd('formatAnswers execution time');
        // Return an array with that single comma-separated string
        return {
            question_option_id: questionOptionIds ? [questionOptionIds] : [],
            answer_text: answers[0].answer_text || null,
        };

    }

    private formatQuestion(question, includeAnswers: boolean) {
        return {
            id: question.id,
            Question: question.question,
            QuestionDescription: question.question_description,
            QuestionType: question.question_type,
            ControlLabel: question.control_label,
            ControlPlaceholder: question.control_placeholder,
            QuestionOrder: question.question_order,
            ReferenceId: question.reference_id,
            IsRequired: question.is_required,
            ...(question.questionValidator ? {
                regex: question.questionValidator.regex,
                min: question.questionValidator.min,
                max: question.questionValidator.max,
                name: question.questionValidator.name,
                message: question.questionValidator.message,
            } : {}),
            Options: question.options
                ?.sort((a, b) => a.id - b.id) // Sort options by `id` in ascending order
                .map(option => ({
                    id: option.id,
                    QuestionId: option.question_id,
                    Name: option.name,
                    SubQuestionId: option.sub_question_id,
                })),
            ...(includeAnswers ? { Answers: this.formatAnswers(question.answer) } : {}),
        };
    }

    private groupQuestionsByStep(questions, includeAnswers: boolean) {

        return questions.reduce((acc, question) => {
            const stepId = question.step_id;

            if (!acc[stepId]) {
                acc[stepId] = {
                    StepId: stepId,
                    Questions: [],
                };
            }
            console.time('formatQuestion execution time');
            acc[stepId].Questions.push(this.formatQuestion(question, includeAnswers));
            console.timeEnd('formatQuestion execution time');
            return acc;
        }, {});

    }

    async getData(id: number): Promise<any> {
        // const questionnaire = await this.fetchQuestionnaire(id, null);
        const questionnaire = await this.questionnaireRepository.data(id, null);
        console.time('groupQuestionsByStep execution time');
        const groupedData = this.groupQuestionsByStep(questionnaire.questions, false);
        console.timeEnd('groupQuestionsByStep execution time');
        return Object.values(groupedData);
    }

    async getUserData(id: number, userId: number): Promise<any> {
        // const questionnaire = await this.fetchQuestionnaire(id, userId);
        const questionnaire = await this.questionnaireRepository.data(id, userId);
        console.time('groupQuestionsByStep execution 2 time');

        const groupedData = this.groupQuestionsByStep(questionnaire.questions, true);
        console.timeEnd('groupQuestionsByStep execution 2 time');

        return Object.values(groupedData);
    }

    async businessPreference(questionnaireId: number, userId: number): Promise<any> {
        // const questionnaire = await this.fetchQuestionnaire(questionnaireId, userId);
        const questionnaire = await this.questionnaireRepository.data(questionnaireId, userId);
        console.time('formattedQuestions execution time');

        // Format each question without grouping by step_id
        const formattedQuestions = questionnaire.questions.map((question) => {
            const answers = question.answer;

            const formattedAnswers = answers && answers.length > 0
                ? {
                    question_option_id: answers.some(ans => ans.question_option_id) // Check if there's at least one valid `question_option_id`
                        ? [answers.map(ans => ans.question_option_id).filter(id => id).join(', ')]
                        : [],
                    answer_text: answers[0].answer_text || null,
                }
                : { question_option_id: [], answer_text: null };

            // const formattedAnswers = answers && answers.length > 0
            //     ? {
            //         question_option_id: answers.map(ans => ans.question_option_id).join(', '),
            //         answer_text: answers[0].answer_text || null,
            //     }
            //     : { question_option_id: [], answer_text: null };

            return {
                id: question.id,
                Question: question.question,
                QuestionDescription: question.question_description,
                QuestionType: question.question_type,
                ControlLabel: question.control_label,
                ControlPlaceholder: question.control_placeholder,
                QuestionOrder: question.question_order,
                ReferenceId: question.reference_id,
                IsRequired: question.is_required,
                ...(question.questionValidator ? {
                    regex: question.questionValidator.regex,
                    min: question.questionValidator.min,
                    max: question.questionValidator.max,
                    name: question.questionValidator.name,
                    message: question.questionValidator.message,
                } : {}),
                Options: question.options?.map(option => ({
                    id: option.id,
                    QuestionId: option.question_id,
                    Name: option.name,
                    SubQuestionId: option.sub_question_id,
                })),
                Answers: formattedAnswers,
            };
        });
        console.timeEnd('formattedQuestions execution time');

        return formattedQuestions;
    }

    async storeData(id: number, userId: number, answers: any[]): Promise<any> {
        console.log(answers, 'answers')
        // Sample answers provided
        // const answers = [
        //     {
        //         "questionId": 1,
        //         "question_option_id": ["3", "4"], // multiple options for questionId 1
        //     },
        //     {
        //         "questionId": 2,
        //         "question_option_id": ["6"], // answer text for questionId 2
        //     },
        //     {
        //         "questionId": 4,
        //         "answer_text": 'www.example.com', // answer text for questionId 5
        //     },
        //     {
        //         "questionId": 5,
        //         "answer_text": 'true', // answer text for questionId 5
        //     },
        // ];
        console.time('storeData execution time');

        // Start transaction
        await this.unitOfWork.startTransaction();

        try {
            // Get the repository for UserAnswer
            const userAnswerRepository = this.unitOfWork.getRepository(
                UserAnswerRepository,
                UserAnswer,
                true
            );

            const userAnswersToSave: UserAnswer[] = []; // Array to collect user answers for bulk save
            const createUserBusiness = new UserBusiness();
            // createUserBusiness.brand_name = '';
            // createUserBusiness.website = '';
            // createUserBusiness.use = '';
            // createUserBusiness.location = '';
            // createUserBusiness.overview = '';
            console.time('Remove outdated execution time');

            const questionMapping = {
                'brand_name': 'brand_name', // Direct field mapping for brand name
                'personal_website': 'website', // Direct field mapping for website
                'target_audiance_location': 'location', // Direct field mapping for location
                // 'overview': 'overview' // Direct field mapping for overview
            };

            // Step 1: Remove outdated answers (those no longer in the request)
            // for (const answer of answers) {
            //     if (answer.question_option_id) {
            //         // If the question has options, check if any options need to be removed
            //         await userAnswerRepository.deleteByFields({
            //             user_id: userId,
            //             question_id: answer.questionId,
            //             question_option_id: Not(In(answer.question_option_id.map(id => parseInt(id)))), // Remove options not present in the new request
            //         });
            //     } else if (answer.answer_text !== undefined) {
            //         // For text answers, just remove the ones that don't match the current request
            //         await userAnswerRepository.deleteByFields({
            //             user_id: userId,
            //             question_id: answer.questionId,
            //             question_option_id: null, // No question option for text answers
            //             answer_text: Not(answer.answer_text), // Remove different text answers
            //         });
            //     }
            // }
            const optionAnswers = [];
            const textAnswers = [];
            console.time('storeData answer execution time');

            for (const answer of answers) {
                if (answer.question_option_id && answer.question_option_id.length > 0) {
                    // Collect option-based answers
                    optionAnswers.push(answer);
                } else if (answer.answer_text !== undefined) {
                    // Collect text-based answers
                    textAnswers.push(answer);
                }
            }
            console.timeEnd('storeData answer execution time');
            console.log(optionAnswers, textAnswers, 'textAnswers')
            // Delete outdated option-based answers in a single batch
            console.time('deleteOptionData')
            if (optionAnswers.length > 0) {
                await userAnswerRepository.deleteOptionData(optionAnswers, userId);
            }
            console.timeEnd('deleteOptionData')
            console.time('deleteTextData')

            // Delete outdated text-based answers in a single batch
            if (textAnswers.length > 0) {
                await userAnswerRepository.deleteTextData(textAnswers, userId);
            }
            console.timeEnd('deleteTextData')
            console.timeEnd('Remove outdated execution time');

            console.time('Handle new or updated answers (both options and text-based) execution end time & storeData execution');

            // Step 2: Handle new or updated answers (both options and text-based)
            for (const answer of answers) {

                const userAnswerRepository = this.unitOfWork.getRepository(
                    UserAnswerRepository,
                    UserAnswer,
                    true
                );
                const q = await this.userQuestionRepository.findOne(answer.questionId)
                //create business
                const questionName = q.question_name;
                console.log(questionName, 'questionName')
                if (questionMapping.hasOwnProperty(questionName)) {
                    // Map the answer to the corresponding field in the UserBusiness object
                    const fieldName = questionMapping[questionName];
                    console.log(fieldName, 'fieldName');
                    if (answer.answer_text !== undefined) {
                        // Save the answer to the mapped field
                        createUserBusiness[fieldName] = answer.answer_text;
                    }
                }

                if (answer.question_option_id) {
                    // If the question has options, process each option
                    for (const optionId of answer.question_option_id) {
                        // let userAnswer = await userAnswerRepository.findOneByFields({
                        //     where: {
                        //         user_id: userId,
                        //         question_id: answer.questionId,
                        //         question_option_id: parseInt(optionId), // Match by question_option_id
                        //     },
                        // });
                        let userAnswer = await userAnswerRepository.userAnswerOne(userId, answer.questionId, parseInt(optionId)
                        );


                        if (!userAnswer) {
                            // If the record does not exist, create a new one
                            userAnswer = new UserAnswer();
                            userAnswer.user_id = userId;
                            userAnswer.question_id = answer.questionId;
                            userAnswer.question_option_id = parseInt(optionId);
                            userAnswer.answer_text = null; // No text answer for this case
                        }

                        // Push the answer to be saved later
                        userAnswersToSave.push(userAnswer); // Collect for bulk save
                    }
                } else if (answer.answer_text !== undefined) {
                    // If it's a text-based answer (no options), handle accordingly
                    let userAnswer = await userAnswerRepository.findOneByFields({
                        where: {
                            user_id: userId,
                            question_id: answer.questionId,
                            question_option_id: null, // For text answers, no option ID
                        },
                    });

                    if (!userAnswer) {
                        // If the record does not exist, create a new one
                        userAnswer = new UserAnswer();
                        userAnswer.user_id = userId;
                        userAnswer.question_id = answer.questionId;
                        userAnswer.question_option_id = null; // No question option
                        userAnswer.answer_text = answer.answer_text;
                    } else {
                        // If the record exists, update the answer text
                        userAnswer.answer_text = answer.answer_text;
                    }

                    // Push the text answer to be saved later
                    userAnswersToSave.push(userAnswer); // Collect for bulk save
                }
            }
            console.timeEnd('Handle new or updated answers (both options and text-based) execution end time & storeData execution');

            // Step 3: Save all collected user answers at once
            if (userAnswersToSave.length > 0) {
                console.time('storeData save execution time');

                await userAnswerRepository.save(userAnswersToSave); // Bulk save
                console.timeEnd('storeData save execution time');

            }
            console.timeEnd('storeData execution time');

            const userBusiness = await this.userBusinessRepo.findUserBusiness(userId);

            if (!userBusiness) {
                await this.userBusinessRepo.create(createUserBusiness);
            } else {
                await this.userBusinessRepo.update(userBusiness.id, createUserBusiness);
            }

            // Commit the transaction
            await this.unitOfWork.completeTransaction();

            return { message: 'User answers have been saved, updated, or removed successfully!' };
        } catch (error) {
            // Rollback in case of error
            await this.unitOfWork.rollbackTransaction();
            throw error; // Re-throw the error to be handled by higher-level catch block
        }
    }


    async questionnaireUserDetail(userId: number) {

        const questionnaireRepository = this.unitOfWork.getRepository(QuestionnaireRepository, Questionnaire, false);
        console.time('findAllWithRelation execution time');
        console.log('Fetching all questionnaires with relations...');


        // Retrieve all questionnaires with their relations
        // const Questionnaires = await questionnaireRepository.findAllWithRelation({
        //     relations: ['questions', 'questions.options', 'questions.questionValidator', 'questions.answer'],
        // });
        const Questionnaires = await questionnaireRepository.getQuestionnaires(userId);
        console.timeEnd('findAllWithRelation execution time');
        console.log(`Fetched ${Questionnaires.length} questionnaires.`);

        const result = [];
        console.time('questionnaire formatting execution time');

        for (const questionnaire of Questionnaires) {
            console.log(`Processing questionnaire: ${questionnaire.name} (ID: ${questionnaire.id})`);

            // Filter answers by userId for each question
            questionnaire.questions.forEach(question => {
                console.log(`Filtering answers for question: ${question.id}`);

                // Filter answers for the specific userId
                question.answer = question.answer.filter((answer) => answer.user_id == userId);
            });

            // Group questions by their step_id
            const steps = questionnaire.questions.reduce((acc, question) => {
                const stepId = question.step_id;
                if (!acc[stepId]) {
                    acc[stepId] = [];
                }
                acc[stepId].push(question);
                return acc;
            }, {});
            console.log(`Grouped questions into ${Object.keys(steps).length} steps.`);

            // Calculate the total steps and completed steps
            const totalSteps = Object.keys(steps).length;

            const completedSteps = Object.values(steps).filter((stepQuestions: Question[]) => {
                // Check if there is at least one answer for any question in the step
                return stepQuestions.some((question: Question) => question.answer.length > 0);
            }).length;;


            // Calculate the completion percentage based on steps
            const percentage = (completedSteps / totalSteps) * 100;

            // Use the duration from the first answer of each question if it exists, otherwise default to '0 min'
            // const minutes = questionnaire.questions
            //     .map(question => question.answer[0]?.duration)
            //     .find(duration => duration) || '0 min';  // If no answer duration, fallback to '0 min'

            // Push the result for the current questionnaire
            result.push({
                icon: questionnaire.image_name || 'default_icon.svg',  // Adjust according to actual field
                name: questionnaire.name,
                time: 'Duration',
                minutes: questionnaire.duration,
                percentage: Math.round(percentage),
                completeStep: completedSteps,
                totalStep: totalSteps,
                id: questionnaire.id
            });
            console.log(`Processed questionnaire: ${questionnaire.name} - Completion: ${Math.round(percentage)}%`);

        }
        console.timeEnd('questionnaire formatting execution time');
        console.log('Finished formatting all questionnaires.');
        return result;
    }

    async questionnaireUserDetail1(userId: number) {
        const questionnaireRepository = this.unitOfWork.getRepository(QuestionnaireRepository, Questionnaire, false);
        console.time('getQuestionnaires execution time');

        // Fetch only the required fields and filter at the query level
        const Questionnaires = await questionnaireRepository.getQuestionnaires(userId);
        console.timeEnd('getQuestionnaires execution time');


        console.time('getQuestionnaires execution format time');

        // Build the response
        const result = Questionnaires.map(questionnaire => {
            const steps = questionnaire.questions.reduce((acc, question) => {
                const stepId = question.step_id;
                if (!acc[stepId]) {
                    acc[stepId] = [];
                }
                acc[stepId].push(question);
                return acc;
            }, {});

            const totalSteps = Object.keys(steps).length;
            const completedSteps = Object.values(steps).filter((stepQuestions: any[]) =>
                stepQuestions.some(question => question.answer && question.answer.length > 0)
            ).length;

            const percentage = (completedSteps / totalSteps) * 100;

            return {
                icon: questionnaire.image_name || 'default_icon.svg',
                name: questionnaire.name,
                time: 'Duration',
                minutes: questionnaire.duration,
                percentage: Math.round(percentage),
                completeStep: completedSteps,
                totalStep: totalSteps,
                id: questionnaire.id,
            };
        });
        console.timeEnd('getQuestionnaires execution format time');

        return result;
    }

}

