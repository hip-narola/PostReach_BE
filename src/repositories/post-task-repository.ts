import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostTask } from 'src/entities/post-task.entity';
import { POST_TASK_STATUS } from 'src/shared/constants/post-task-status-constants';

@Injectable()
export class PostTaskRepository extends GenericRepository<PostTask> {
    constructor(
        @InjectRepository(PostTask)
        repository: Repository<PostTask>,
    ) {
        super(repository);
    }

    async fetchPostsofUser(user_id: number): Promise<PostTask[]>{
        const currentDate = new Date();
        const currentDateOnly = currentDate.toISOString().split('T')[0];
        const posts = await this.repository
            .createQueryBuilder('postTask')
            .leftJoinAndSelect('postTask.post', 'post')
            .leftJoinAndSelect(
                'postTask.socialMediaAccount',
                'socialMediaAccount',
            )
            .leftJoinAndSelect('socialMediaAccount.user', 'user')
            .where('postTask.user_id = :user_id', { user_id })
            .andWhere('postTask.status = :status', {
                status: POST_TASK_STATUS.SCHEDULED,
            })
            .andWhere('postTask.created_at = :created_at', {
                created_at: currentDateOnly,
            })
            .getMany();         

        return posts;
    }

}
