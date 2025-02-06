import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaginationParamDto } from 'src/dtos/params/pagination-param.dto';
import { UpdatePostTaskStatusDTO } from 'src/dtos/params/update-post-task-status.dto';
import { PaginatedResponseDto } from 'src/dtos/response/pagination-response.dto';
import { RejectReasonResponseDTO } from 'src/dtos/response/reject-reason-response.dto';
import { PostTask } from 'src/entities/post-task.entity';
import { RejectReason } from 'src/entities/reject-reason.entity';
import { ApprovalQueueRepository } from 'src/repositories/approval-queue-repository';
import { RejectReasonRepository } from 'src/repositories/reject-reason-repository';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { EmailService } from '../email/email.service';
import { JobSchedulerService } from 'src/scheduler/job-scheduler-service';
import { POST_TASK_STATUS } from 'src/shared/constants/post-task-status-constants';
import { NotificationService } from '../notification/notification.service';
import { NotificationMessage, NotificationType } from 'src/shared/constants/notification-constants';
@Injectable()
export class ApprovalQueueService {
    constructor(
        private readonly unitOfWork: UnitOfWork,
        @Inject(forwardRef(() => JobSchedulerService)) // Use forwardRef here
        private readonly schedulePostService: JobSchedulerService,
        private readonly emailService: EmailService,
        private readonly notificationService: NotificationService,
    ) { }

    async getApprovalQueueList(
        paginatedParams: PaginationParamDto,
    ): Promise<PaginatedResponseDto> {
        const approvalQueueRepository = this.unitOfWork.getRepository(
            ApprovalQueueRepository,
            PostTask,
            false,
        );
        const data =
            await approvalQueueRepository.getApprovalQueueList(paginatedParams);
        return data;
    }

    async updateStatus(
        updateStatusParam: UpdatePostTaskStatusDTO,
    ): Promise<any> {
        try {

            await this.unitOfWork.startTransaction();
            const approvalQueueRepository = this.unitOfWork.getRepository(
                ApprovalQueueRepository,
                PostTask,
                true,
            );
            for (const id of updateStatusParam.id) {
                const record = await approvalQueueRepository.findOne(id);
                if (!record) {
                    continue;
                }
                //if approved true then if block will executed.
                if (updateStatusParam.isApproved == true) {
                    //updated the status to scheduled
                    record.status = POST_TASK_STATUS.SCHEDULED;
                    await approvalQueueRepository.update(id, record);
                    // scheduled the post.
                    const data =
                        await approvalQueueRepository.getScheduledPostByPostTaskID(
                            id,
                        );

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
                // if approved false then else if block executed.
                else if (updateStatusParam.isApproved == false) {

                    record.status = POST_TASK_STATUS.REJECTED;
                    record.rejectReason = updateStatusParam.rejectReason;
                    const rejectReasonRepository =
                        this.unitOfWork.getRepository(
                            RejectReasonRepository,
                            RejectReason,
                            false,
                        );
                    const rejectReason = await rejectReasonRepository.findOne(
                        updateStatusParam.rejectreasonId,
                    );
                    if (!rejectReason) {
                        continue;
                    }

                    record.RejectReason = rejectReason;

                    await approvalQueueRepository.update(id, record);
                }
            }
            await this.unitOfWork.completeTransaction();
            if (updateStatusParam.isApproved == true) {
                return true;
            } else if (updateStatusParam.isApproved == false) {
                return false;
            }
        } catch (error) {
            console.log('removeExpiredScheduledPosts error', error);
            await this.unitOfWork.rollbackTransaction();
            throw error;
        }
    }

    RejectReasonList(): Promise<RejectReasonResponseDTO[]> {
        const rejectReasonRepository = this.unitOfWork.getRepository(
            RejectReasonRepository,
            RejectReason,
            false,
        );
        const data = rejectReasonRepository.findAll();
        return data;
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

            // await this.emailService.sendEmail(record.user.email, 'Post Posted', 'post_success');

            await this.unitOfWork.completeTransaction();
        } catch (error) {
            console.log("updateStatusAfterPostExecution error:: ", error);
            await this.unitOfWork.rollbackTransaction();
            throw error;
        }
    }
}
