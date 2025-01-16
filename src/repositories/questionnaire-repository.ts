import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
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
        return this.repository.find({
            where: { is_active: true },
            relations: ['questions', 'questions.options'],
        });
    }
}