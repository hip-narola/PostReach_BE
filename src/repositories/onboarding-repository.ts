import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/entities/question.entity';
@Injectable()
export class OnboardingRepository extends GenericRepository<Question> {
    constructor(
        @InjectRepository(Question)
        repository: Repository<Question>) {
        super(repository);
    }

    async findQuestionsWithAnswers(): Promise<Question[]> {
        return this.repository.createQueryBuilder('question')
            .select([
                'question.id', 
                'question.step_id', 
                'question.question_order', 
                'question.question_type',
                'question.question', 
                'question.question_description', 
                'question.control_label', 
                'question.control_placeholder', 
                'question.is_required',
                'option.id', 
                'option.name', 
                'option.sub_question_id',
            ])
            .leftJoinAndSelect('question.options', 'option') // Join options table
            .andWhere('questionnaire.is_active = :is_active', { is_active: true })
            // Remove the `questionnaire.is_active` condition unless you explicitly join the questionnaire table
            .orderBy('question.step_id', 'ASC')
            .addOrderBy('question.question_order', 'ASC')
            .getMany();
    }
}