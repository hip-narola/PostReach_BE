import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/entities/question.entity';

@Injectable()
export class UserQuestionRepository extends GenericRepository<Question> {
    constructor(
        @InjectRepository(Question)
        repository: Repository<Question>) {
        super(repository);
    }

}