import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GenericRepository } from './generic-repository';
import { PostTask } from 'src/entities/post-task.entity';
import { CalenderParamDto } from 'src/dtos/params/calender-param.dto';
import { SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';
import { POST_TASK_STATUS } from 'src/shared/constants/post-task-status-constants';
import { ASSET_TYPE } from 'src/shared/constants/asset-type-constants';

@Injectable()
export class CalenderRepository extends GenericRepository<PostTask> {
    constructor(repository: Repository<PostTask>) {
        super(repository);
    }

    async getCalenderList(paginatedParams: CalenderParamDto): Promise<any> {
        try {

            const postTasks = await this.repository.createQueryBuilder('pt')
                .select([
                    'pt.id AS post_task_id',
                    'a.url AS image',
                    'p.content AS content',
                    'sm.platform AS socialimage',
                    'pt.scheduled_at AS start',
                    'pt.scheduled_at AS end',
                    "TO_CHAR(pt.scheduled_at, 'HH:MI AM') AS time",
                    'sm.user_name AS user',
                    'sm.user_profile AS profileimage',
                ])
                .leftJoin('pt.post', 'p')
                .leftJoin('p.assets', 'a', 'a.type = :type', { type: ASSET_TYPE.IMAGE })
                .leftJoin('pt.socialMediaAccount', 'sm')
                .leftJoin('pt.user', 'ur')
                .where('pt.status IN (:...statuses)', { statuses: [POST_TASK_STATUS.EXECUTE_SUCCESS, POST_TASK_STATUS.SCHEDULED] })
                .andWhere('pt.user_id = :userid', { userid: paginatedParams.userId })
                .andWhere('DATE(pt.scheduled_at) BETWEEN :startDate AND :endDate', {
                    startDate: paginatedParams.startWeekDate,
                    endDate: paginatedParams.endWeekDate,
                })
                .addSelect('pt.scheduled_at::text AS scheduled_at_date')
                .orderBy('pt.scheduled_at', 'DESC')
                .getRawMany();

            const data = postTasks.map(queryResult => ({
                id: queryResult.post_task_id,
                channel: Object.keys(SocialMediaPlatformNames).find(key => SocialMediaPlatformNames[key] == queryResult.socialimage),
                start: queryResult.scheduled_at_date,
                end: queryResult.scheduled_at_date,
                time: queryResult.time,
                user: queryResult.user,
                profileImage: queryResult.profileimage,
                content: queryResult.content,
                image: queryResult.image,
            }));
            return data;
        }
        catch (error) {
            throw error;
        }

    }

}