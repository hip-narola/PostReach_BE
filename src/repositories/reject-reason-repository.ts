import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { UserBusiness } from 'src/entities/user-business.entity';
import { RejectReason } from 'src/entities/reject-reason.entity';

@Injectable()
export class RejectReasonRepository extends GenericRepository<RejectReason> {
    constructor(repository: Repository<RejectReason>) {
      	super(repository);
    }
}