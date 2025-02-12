import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { RejectReason } from 'src/entities/reject-reason.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RejectReasonRepository extends GenericRepository<RejectReason> {
    constructor(
        @InjectRepository(RejectReason)
        repository: Repository<RejectReason>) { 
      	super(repository);
    }
}