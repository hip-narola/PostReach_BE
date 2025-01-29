import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { UserBusiness } from 'src/entities/user-business.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserBusinessRepository extends GenericRepository<UserBusiness> {

    constructor(
        @InjectRepository(UserBusiness)
        repository: Repository<UserBusiness>) {
        super(repository);
    }
    async findUserBusiness(user_id: number) {
        // });
        return this.repository.createQueryBuilder('user_business')
            .where('user_business.user_id = :user_id', { user_id })
            .getOne();
    }
}