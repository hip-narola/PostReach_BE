import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { RejectReason } from 'src/entities/reject-reason.entity';

@Injectable()
export class RejectReasonRepository extends GenericRepository<RejectReason> {
    constructor(repository: Repository<RejectReason>) {
      	super(repository);
    }
}