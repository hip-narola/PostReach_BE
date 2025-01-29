import { Injectable, NotFoundException } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Questionnaire } from 'src/entities/questionnaire.entity';

@Injectable()
export class QuestionnaireRepository extends GenericRepository<Questionnaire> {
    constructor(
        @InjectRepository(Questionnaire)
        repository: Repository<Questionnaire>) {
        super(repository);
    }
    async findQuestionsWithAnswers(): Promise<Questionnaire[]> {
        // return this.repository.find({
        //     where: { is_active: true },
        //     relations: ['questions', 'questions.options'],
        // });
        return this.repository.createQueryBuilder('questionnaire')
        .select([
            'questionnaire.id', 'questionnaire.is_active',
            'question.id', 'question.step_id', 'question.question_order', 'question.question_type',
            'question.question', 'question.question_description', 'question.control_label', 'question.control_placeholder', 'question.is_required',
            'option.id', 'option.name', 'option.sub_question_id',
            'questionValidator.regex', 'questionValidator.min', 'questionValidator.max', 'questionValidator.name', 'questionValidator.message',
        ])
        .leftJoinAndSelect('questionnaire.questions', 'question')
        .leftJoinAndSelect('question.options', 'option')
        .andWhere('questionnaire.is_active = :is_active', { is_active: true })
        .getMany();
    }

    async data(id: number, userId: number) {
        console.time('data questionnaire execution time');

        const queryBuilder = this.repository.createQueryBuilder('questionnaire')
            .select([
                'questionnaire.id', 'questionnaire.is_active',
                'question.id', 'question.step_id', 'question.question_order', 'question.question_type',
                'question.question', 'question.question_description', 'question.control_label', 'question.control_placeholder', 'question.is_required',
                'option.id', 'option.name', 'option.sub_question_id',
                'questionValidator.regex', 'questionValidator.min', 'questionValidator.max', 'questionValidator.name', 'questionValidator.message',
            ])
            .leftJoinAndSelect('questionnaire.questions', 'question')
            .leftJoinAndSelect('question.options', 'option')
            .leftJoinAndSelect('question.questionValidator', 'questionValidator');

        // Conditionally join and filter the answers based on userId
        if (userId != null) {
            queryBuilder.leftJoinAndSelect('question.answer', 'answer', 'answer.user_id = :userId', { userId });
        } else {
            queryBuilder.leftJoinAndSelect('question.answer', 'answer');
        }
        console.timeEnd('data questionnaire execution time');
        console.time('data questionnaire');

        // Apply where conditions and sorting
        const questionnaire = await queryBuilder
            .where('questionnaire.id = :id', { id })
            .andWhere('questionnaire.is_active = :is_active', { is_active: true })
            .orderBy('question.step_id', 'ASC')
            .addOrderBy('question.question_order', 'ASC')
            .getOne();
            console.timeEnd('data questionnaire');

        if (!questionnaire) {
            throw new NotFoundException(`Questionnaire with ID "${id}" not found.`);
        }

        return questionnaire;
    }

    async getQuestionnaires(userId: number) {
        return await this.repository.createQueryBuilder('questionnaire')
            .select([
                'questionnaire.id',
                'questionnaire.name',
                'questionnaire.image_name',
                'questionnaire.duration',
                'question.id',
                'question.step_id',
                'answer.user_id',
            ])
            .leftJoin('questionnaire.questions', 'question')
            .leftJoin('question.answer', 'answer', 'answer.user_id = :userId', { userId }) // Filter answers by userId in the query
            .getMany();
    }
}