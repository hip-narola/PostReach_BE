import { Injectable } from '@nestjs/common';
import { PostJobLog } from 'src/entities/post-job-log.entity';
import { PostJobLogRepository } from 'src/repositories/postJobLog-repository';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { Logger } from '../logger/logger.service';

@Injectable()
export class PostJobLogService {

    constructor(
        private readonly unitOfWork: UnitOfWork,
        private readonly logger: Logger
    ) { }

    async createPostJobLog(postJobLogData: PostJobLog): Promise<void> {
        try {
            await this.unitOfWork.startTransaction();
            const postJobLogRepository = this.unitOfWork.getRepository(PostJobLogRepository, PostJobLog, true);
            await postJobLogRepository.create(postJobLogData);
            await this.unitOfWork.completeTransaction();
        }
        catch (error) {

            await this.unitOfWork.rollbackTransaction();
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'createPostJobLog'
            );
            throw error;
        }
    }

    async findPostJobLogByPostTaskId(postTaskId: number) {
        const postJobLogRepository = this.unitOfWork.getRepository(PostJobLogRepository, PostJobLog, false);
        const postJobLogDetails = postJobLogRepository.findPostJobLogByPostTaskId(postTaskId);
        return postJobLogDetails;
    }


    async updatePostJobLog(postJobLogData: PostJobLog): Promise<void> {

        try {
            await this.unitOfWork.startTransaction();
            const postJobLogRepository = this.unitOfWork.getRepository(PostJobLogRepository, PostJobLog, true);
            await postJobLogRepository.update(postJobLogData.id, postJobLogData);
            await this.unitOfWork.completeTransaction();
        }
        catch (error) {
            await this.unitOfWork.rollbackTransaction();
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'createPostJobLog'
            );
            throw error;
        }

    }



}
