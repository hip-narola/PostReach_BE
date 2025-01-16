import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { UserBusiness } from 'src/entities/user-business.entity';

@Injectable()
export class UserBusinessRepository extends GenericRepository<UserBusiness> {
    constructor(repository: Repository<UserBusiness>) {
      	super(repository);
    }
}