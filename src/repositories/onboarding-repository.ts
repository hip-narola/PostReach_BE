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
        return this.repository.find({
            relations: ['options'],
            order: { step_id: 'ASC', question_order: 'ASC' },
        });
    }
}