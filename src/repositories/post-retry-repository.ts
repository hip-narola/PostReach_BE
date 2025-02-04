import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { PostRetry } from 'src/entities/post-retry.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { POST_RESPONSE } from 'src/shared/constants/post-response-constants';

@Injectable()
export class PostRetryRepository extends GenericRepository<PostRetry> {
    constructor(@InjectRepository(PostRetry)
    repository: Repository<PostRetry>) {
        super(repository);
    }
    async getAllPostRetryPosts() {
        return await this.repository
            .createQueryBuilder('post_retry')
            .select([
                'post_retry.id',
                'post_retry.pipeline_id',
                'post_retry.user_id',
                'post_retry.credit_id',
                'post_retry.retry_count',
                'post_retry.retry_count',
            ])
            .where('post_retry.retry_count > :retry_count', { retry_count: 0 })
            .andWhere('post_retry.status IN (:...statuses)', { statuses: [POST_RESPONSE.PROCESSING, POST_RESPONSE.FAILED] })            
            .getMany();
    }
}