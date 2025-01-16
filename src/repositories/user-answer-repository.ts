import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { UserAnswer } from 'src/entities/user-answer.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserAnswerRepository extends GenericRepository<UserAnswer> {
    constructor(       
        @InjectRepository(UserAnswer)
        repository: Repository<UserAnswer>) {
      	super(repository);
    }
}