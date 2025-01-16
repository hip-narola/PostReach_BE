import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { PostJobLog } from 'src/entities/post-job-log.entity';

@Injectable()
export class PostJobLogRepository extends GenericRepository<PostJobLog> {
    constructor(repository: Repository<PostJobLog>) {
        super(repository);
    }

    async findPostJobLogByPostTaskId(postId: number): Promise<PostJobLog | null> {
        const postJobLog = await this.repository.findOne({
          where: { postTask: { id: postId } },
          relations: ['postTask'], 
        });
        return postJobLog;
      }

}