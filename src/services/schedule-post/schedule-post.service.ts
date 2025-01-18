import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as moment from 'moment';
import Redis from 'ioredis';
import { NotificationService } from '../notification/notification.service';
import { ApprovalQueueService } from '../approval-queue/approval-queue.service';
import { REJECT_REASONS } from 'src/shared/constants/reject-reason-constants';
import { CheckUserSubscriptionService } from '../check-user-subscription/check-user-subscription.service';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { UserCreditRepository } from 'src/repositories/user-credit-repository';
import { UserCredit } from 'src/entities/user_credit.entity';

@Injectable()
export class PostService {
    private redisClient: Redis;
    constructor(
        @InjectQueue('post-queue') private readonly postQueue: Queue,
        // private readonly approvalQueueService: ApprovalQueueService,
        @Inject(forwardRef(() => ApprovalQueueService)) // Use forwardRef here
        private readonly approvalQueueService: ApprovalQueueService,
        private readonly checkUserSubscriptionService: CheckUserSubscriptionService,
        private readonly notificationService: NotificationService,
        private readonly unitOfWork: UnitOfWork,

    ) { }

    async schedulePost(
        Id: number,
        channel: string,
        PostId: number,
        accessToken: string,
        message: string,
        scheduleTime: any,
        hashtags?: string[],
        imageUrl?: string,
        pageId?: string,
        SocialMediauserId?: string,
        tokenType?: string,
        instagramId?: number,
        userId?: number,
        post_created_at?: Date
    ): Promise<void> {
        const now = moment();
        const publishAt = moment(scheduleTime, 'YYYY-MM-DD HH:mm:ss');

        const isUserSubscriptionActive = await this.checkUserSubscriptionService.isUserSubscriptionActive(userId);
        if (!isUserSubscriptionActive) {
            throw new BadRequestException(
                'Please purchase a subscription first!',
            );
        }

        if (!publishAt.isValid()) {
            throw new BadRequestException(
                'Invalid schedule time format. Expected format: YYYY-MM-DD HH:mm:ss',
            );
        }
        const delay = publishAt.diff(now);
        if (delay <= 0) {
            throw new BadRequestException(
                'Schedule time must be in the future.',
            );
        }
        await this.postQueue.add(
            'publish-post',
            {
                Id,
                channel,
                PostId,
                accessToken,
                message,
                hashtags,
                imageUrl,
                pageId,
                SocialMediauserId,
                scheduleTime,
                tokenType,
                instagramId,
                userId,
                post_created_at
            },
            {
                delay,
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            },
        );
    }

    async removeExpiredScheduledPosts(
        expiredSubscriptions: { userId: number; endDate: Date; subscription: string; cycle: number }[]
    ) {
        try {
            // Fetch all jobs from the post queue
            const jobs = await this.postQueue.getJobs(['delayed', 'waiting', 'active']);
            const now = moment(); // Current date

            // Filter jobs to find the ones to be removed
            const jobsToRemove = await this.getJobsToRemove(jobs, expiredSubscriptions, now);
            // Remove jobs and collect IDs
            if (jobsToRemove.length > 0) {
                const ids = await this.removeJobs(jobsToRemove);
                // Update status for removed jobs
                const postTaskStatusData = {
                    id: ids,
                    isApproved: false,
                    rejectreasonId: 7, // Subscription cancelled or expired
                    rejectReason: REJECT_REASONS[7],
                };

                await this.approvalQueueService.updateStatus(postTaskStatusData);
            }

        } catch (error) {
        }
    }

    private async getJobsToRemove(
        jobs: any[],
        expiredSubscriptions: { userId: number; endDate: Date; subscription: string; cycle: number }[],
        now: moment.Moment
    ): Promise<any[]> {
        return await Promise.all(
            jobs.filter(async (job) => {
                const expiredSubscription = expiredSubscriptions.find(
                    (sub) => sub.userId == job.data.userId
                );

                if (expiredSubscription) {
                    const scheduleTime = moment(job.data.scheduleTime);
                    const endDate = moment(expiredSubscription.endDate);
                    if (expiredSubscription.cycle == 1) {
                        if (scheduleTime.isSameOrAfter(now, 'day') && scheduleTime.isBefore(endDate, 'day')) {
                            if (moment(job.data.post_created_at).isBefore(endDate, 'day')) {
                                const isValid = await this.validateJobWithinCredits(
                                    expiredSubscription.userId,
                                    job.data.post_created_at,
                                    scheduleTime,
                                    endDate
                                );
                                return isValid;
                            }
                        }
                    } else {
                        return scheduleTime.isSameOrAfter(now, 'day') && scheduleTime.isBefore(endDate, 'day');
                    }
                }
                return false;
            })
        );
    }

    private async validateJobWithinCredits(
        userId: number,
        postCreatedAt: moment.Moment,
        scheduleTime: moment.Moment,
        endDate: moment.Moment
    ): Promise<boolean> {
        const userCreditRepository = this.unitOfWork.getRepository(
            UserCreditRepository,
            UserCredit,
            false
        );

        const userCredits = await userCreditRepository.getUserCredits(userId);
        if (userCredits) {
            const lastTriggerDate = moment(userCredits.last_trigger_date);
            // return postCreatedAt.isSameOrAfter(lastTriggerDate, 'day') && scheduleTime.isBefore(userCredits[0].cancel_Date, 'day');
            return postCreatedAt.isAfter(lastTriggerDate, 'day') && scheduleTime.isBefore(userCredits.cancel_Date, 'day');
        }
        // && scheduleTime.isBefore(endDate, 'day')
        return false;
    }

    private async removeJobs(jobsToRemove: any[]): Promise<number[]> {
        const ids: number[] = [];
        await Promise.all(
            jobsToRemove.map(async (job) => {
                try {
                    await job.remove();
                    ids.push(job.data.Id); // Collect removed job IDs
                } catch (error) {
                    throw error;
                }
            })
        );
        return ids;
    }

}
