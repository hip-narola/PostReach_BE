import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GenericRepository } from './generic-repository';
import { PostTask } from 'src/entities/post-task.entity';

@Injectable()
export class DashboardInsightsRepository extends GenericRepository<PostTask> {
    constructor(repository: Repository<PostTask>) {
        super(repository);
    }

    async getTotalPostList(userId: number, platform: string | null = null, statuses: string[]): Promise<number> {
        try {

            const queryBuilder = this.repository.createQueryBuilder('pt')
                .leftJoin('pt.socialMediaAccount', 'sm')
                .andWhere('pt.user_id = :userid', { userid: userId })
                .andWhere('sm.isDisconnect = :isDisconnect', { isDisconnect: false });

            if (platform != null) {
                queryBuilder.andWhere('sm.platform = :platform', { platform: platform });
            }

            if (statuses.length > 0) {
                queryBuilder.andWhere('pt.status IN (:...statuses)', { statuses: statuses }).getCount();
            }

            return await queryBuilder.getCount();
        }
        catch (error) {
            throw error;
        }
    }
}
