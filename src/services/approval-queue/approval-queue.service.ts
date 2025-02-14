import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaginationParamDto } from 'src/dtos/params/pagination-param.dto';
import { UpdatePostTaskStatusDTO } from 'src/dtos/params/update-post-task-status.dto';
import { PaginatedResponseDto } from 'src/dtos/response/pagination-response.dto';
import { RejectReasonResponseDTO } from 'src/dtos/response/reject-reason-response.dto';
import { PostTask } from 'src/entities/post-task.entity';
import { ApprovalQueueRepository } from 'src/repositories/approval-queue-repository';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { EmailService } from '../email/email.service';
import { JobSchedulerService } from 'src/scheduler/job-scheduler-service';
import { POST_TASK_STATUS } from 'src/shared/constants/post-task-status-constants';
import { NotificationService } from '../notification/notification.service';
import { NotificationMessage, NotificationType } from 'src/shared/constants/notification-constants';
import { Logger } from '../logger/logger.service';
import { RejectReasonRepository } from 'src/repositories/reject-reason-repository';
import moment from 'moment';

@Injectable()
export class ApprovalQueueService {
    constructor(
        private readonly unitOfWork: UnitOfWork,
        @Inject(forwardRef(() => JobSchedulerService)) // Use forwardRef here
        private readonly schedulePostService: JobSchedulerService,
        private readonly emailService: EmailService,
        private readonly notificationService: NotificationService,
        private readonly logger: Logger,
        private readonly approvalQueueRepository: ApprovalQueueRepository,
        private readonly rejectReasonRepository: RejectReasonRepository

    ) { }

    async getApprovalQueueList(
        paginatedParams: PaginationParamDto,
    ): Promise<PaginatedResponseDto> {
        const data =
            await this.approvalQueueRepository.getApprovalQueueList(paginatedParams);
        return data;
    }

    async updateStatus(updateStatusParam: UpdatePostTaskStatusDTO): Promise<string> {
        try {
            for (const id of updateStatusParam.id) {
                const record = await this.approvalQueueRepository.findPosttaskWithUser(id);

                if (!record) {
                    continue;
                }

                if (updateStatusParam.isApproved == true) {
                    
                    const data = await this.approvalQueueRepository.getScheduledPostByPostTaskID(id);
                    if (data != null) {
                        console.log("updateStatus data.scheduleTime :::", data.scheduleTime);
                        
                        const publishAt = moment(data.scheduleTime, 'YYYY-MM-DD HH:mm:ss');
                        console.log("updateStatus publishAt :::", publishAt);
                
                        const delay = publishAt.diff(moment());
                        if (delay <= 0) {
                            continue;
                        }
                        
                        record.status = POST_TASK_STATUS.SCHEDULED;
                        await this.approvalQueueRepository.update(id, record);

                        await this.schedulePostService.schedulePost(
                            data.id,
                            data.channel,
                            data.postId,
                            data.accessToken,
                            data.content,
                            data.scheduled_at,
                            data.hashtags,
                            data.image,
                            data.pageId,
                            data.social_media_user_id,
                            data.token_type,
                            data.instagramId,
                            data.userId,
                            data.post_created_at
                        );
                    }
                }
                // if approved false then else if block executed.
                else if (updateStatusParam.isApproved == false) {
                    console.log('post rejected');
                    record.status = POST_TASK_STATUS.REJECTED;
                    
                    const rejectReasonList = await this.RejectReasonList();
                    const rejectReason = rejectReasonList.find(x => x.id == updateStatusParam.rejectreasonId);
                    console.log('rejectReasonList', rejectReasonList);
                    console.log('rejectReason', rejectReason);

                    record.RejectReason = (!rejectReason) ? new RejectReasonResponseDTO() : rejectReason;
                    console.log('record rejected', record);
                    await this.approvalQueueRepository.update(id, record);
                }
            }

            if (updateStatusParam.isApproved == true) {
                return 'Post(s) approved successfully.';
            } else if (updateStatusParam.isApproved == false) {
                return 'Post(s) rejected successfully.';
            }
            
        } catch (error) {
            console.log('approve reject updateStatus error', error);
            this.logger.error(`Error ${error.stack || error.message}`, 'updateStatus');

            return "Not able to update the post status. Please again later.";
        }
    }

    RejectReasonList(): Promise<RejectReasonResponseDTO[]> {
        return this.rejectReasonRepository.getAllRejectReasons();
    }

    // update the status for post execution success or failure.
    async updateStatusAfterPostExecution(id: number, status: string, userId: number) {
        try {
            await this.unitOfWork.startTransaction();
            const approvalQueueRepository = this.unitOfWork.getRepository(
                ApprovalQueueRepository,
                PostTask,
                true,
            );

            console.log("updateStatusAfterPostExecution id: ", id)
            const record = await approvalQueueRepository.findOne(id);
            record.status = status;

            console.log("updateStatusAfterPostExecution update staus id record: ", id, record);

            await approvalQueueRepository.update(id, record);

            console.log("updateStatusAfterPostExecution post-queue save notification");
            // Add notification
            const notificationType = status == POST_TASK_STATUS.FAIL ? POST_TASK_STATUS.FAIL : POST_TASK_STATUS.EXECUTE_SUCCESS;
            const notificationContent = status == POST_TASK_STATUS.FAIL ? NotificationMessage[NotificationType.POST_FAILED] : NotificationMessage[NotificationType.POST_PUBLISHED];

            console.log("updateStatusAfterPostExecution post-queue save notification : user id notificationType content", userId, notificationType, notificationContent);
            await this.notificationService.saveData(userId, notificationType, notificationContent);

            await this.emailService.sendEmail(record.user.email, 'Post Posted', 'post_success');

            await this.unitOfWork.completeTransaction();
        } catch (error) {
            console.log("updateStatusAfterPostExecution error:: ", error);
            await this.unitOfWork.rollbackTransaction();
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'updateStatusAfterPostExecution'
            );
            throw error;
        }
    }
}
