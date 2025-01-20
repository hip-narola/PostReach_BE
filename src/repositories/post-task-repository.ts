import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostTask } from 'src/entities/post-task.entity';

@Injectable()
export class PostTaskRepository extends GenericRepository<PostTask> {
    constructor(
        @InjectRepository(PostTask)
        repository: Repository<PostTask>,
    ) {
        super(repository);
    }
}
