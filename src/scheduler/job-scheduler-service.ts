import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as moment from 'moment';
import { REJECT_REASONS } from 'src/shared/constants/reject-reason-constants';
import { ApprovalQueueService } from 'src/services/approval-queue/approval-queue.service';
import { CheckUserSubscriptionService } from 'src/services/check-user-subscription/check-user-subscription.service';
import { UserCreditRepository } from 'src/repositories/user-credit-repository';
import { UserCredit } from 'src/entities/user_credit.entity';
import { UnitOfWork } from 'src/unitofwork/unitofwork';

@Injectable()
export class JobSchedulerService {

    constructor(
        @InjectQueue('post-queue') private readonly postQueue: Queue,
        @InjectQueue('post-insight') private readonly postInsightQueue: Queue,
        @InjectQueue('page-insight') private readonly pageInsightQueue: Queue,
        @InjectQueue('generate-post') private readonly generatePostQueue: Queue,
        @InjectQueue('subscription-queue') private readonly subscriptionQueue: Queue,
        @Inject(forwardRef(() => ApprovalQueueService)) // Use forwardRef here
        private readonly approvalQueueService: ApprovalQueueService,
        private readonly checkUserSubscriptionService: CheckUserSubscriptionService,
        private readonly unitOfWork: UnitOfWork
    ) { }

    async onModuleInit() {
        try {
            // post insight
            await this.scheduleHalfHourlyJobs();
            // page insight
            await this.scheduleHourlyJob();
            // generate post
            await this.scheduleDailyJob();
            // subscription
            // Add a repeatable job to run every minute
            await this.subscriptionQueue.add(
                'check-subscriptions',
                {}, // Job data, if needed
                {
                    // repeat: {
                    //     every: 5 * 60 * 1000, // Run every 5 minute
                    // },
                    // repeat: {

                    //     every: 24 * 60 * 60 * 1000, // Every 24 hours
                    //     startDate: new Date().setHours(0, 1, 0, 0), // Start at 12:01 AM
                    // }
                    repeat: {
                        pattern: '0 0 * * *', // Every 24 hours
                    }
                },
            );
        } catch (error) {
        }
    }

    // post queue
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
                    (sub) => sub.userId === (job?.data?.userId ?? null)
                );

                if (expiredSubscription) {
                    const scheduleTime = moment(job.data.scheduleTime);
                    const postCreatedAt = moment(job.data.post_created_at);
                    const endDate = moment(expiredSubscription.endDate);

                    if (expiredSubscription.cycle == 1) {
                        // Handle first cycle: check if the post is created before cancellation
                        if (scheduleTime.isSameOrAfter(now, 'day') && scheduleTime.isBefore(endDate, 'day')) {
                            if (postCreatedAt.isBefore(endDate, 'day')) {
                                const isValid = await this.validateJobWithinCredits(
                                    expiredSubscription.userId,
                                    postCreatedAt,
                                    scheduleTime,
                                    endDate
                                );
                                return isValid;
                            }
                            // else {
                            //     // Post created after end date in the first cycle - remove
                            //     return true;
                            // }
                        }
                    } else {
                        // Handle subsequent cycles: remove posts scheduled after cancellation
                        if (scheduleTime.isSameOrAfter(now, 'day') && scheduleTime.isSameOrAfter(endDate, 'day')) {
                            return true;
                        }
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
            const cancelDate = moment(userCredits.cancel_Date);

            // Validate job within credits: must be after the last trigger date and before the cancellation date
            return (
                postCreatedAt.isAfter(lastTriggerDate, 'day') &&
                scheduleTime.isBefore(cancelDate, 'day')
            );
        }
        return false;
    }

    private async removeJobs(jobsToRemove: any[]): Promise<number[]> {
        const ids: number[] = [];

        await Promise.all(
            jobsToRemove.map(async (job) => {

                // Check if job exists and has the remove method
                if (job && typeof job.remove === 'function') {
                    try {
                        const jobId = job?.data?.Id ?? null; // Safely access job.data.Id
                        // Attempt to remove the job
                        if (jobId !== null) {
                            ids.push(jobId); // Collect valid job IDs
                        } else {
                        }
                        await job.remove();


                    } catch (error) {
                        // Handle any error during job removal
                    }
                } else {
                    // Warn if job is undefined or doesn't have a remove method
                    // console.warn('Job is undefined or does not have remove method:', job);
                }
            })
        );

        return ids;
    }

    private async scheduleDailyJob() {
        const existingJobs = await this.generatePostQueue.getRepeatableJobs();
        const jobName = 'call-subscription-scheduler-service';

        // Prevent duplicate job schedules
        if (existingJobs.some((job) => job.name === jobName)) {
            return;
        }

        await this.generatePostQueue.add(
            jobName,
            {}, // Empty payload for the job
            {
                repeat: {
                    pattern: '0 0 * * *', // Cron pattern for daily at midnight
                    tz: 'UTC',
                },
                removeOnComplete: false,
                removeOnFail: false,
            }
        );

    }

    private async scheduleHalfHourlyJobs() {
        const existingJobs = await this.postInsightQueue.getRepeatableJobs();
        const jobName = 'fetch-and-update-likes-comments-views';

        // Prevent duplicate job schedules
        if (existingJobs.some((job) => job.name === jobName)) {
            return;
        }

        await this.postInsightQueue.add(
            jobName,
            {}, // Empty payload for the job
            {
                repeat: {
                    //   pattern: '0,30 * * * *', // Correct cron syntax for half-hourly schedule
                    pattern: '0,30 * * * *',
                    tz: 'UTC', // Optional timezone
                },
                removeOnComplete: true,
                removeOnFail: true,
            }
        );

    }

    private async scheduleHourlyJob(): Promise<void> {

        const jobId = 'fetch-and-update-hourly';
        const existingJobs = await this.pageInsightQueue.getJobs(['waiting', 'active', 'delayed', 'paused']);
        for (const job of existingJobs) {
            if (job.id === jobId) {
                await job.remove();
                break;
            }
        }

        await this.pageInsightQueue.add(
            'fetch-and-update',
            {},
            {
                repeat: {
                    pattern: '*/30 * * * *',
                },
                jobId,
            }
        );
    }

    // private async subscriptionSchedulerJob(): Promise<void> {
    //     const jobId = 'check-subscriptions';
    //     // const existingJobs = await this.subscriptionQueue.getJobs(['waiting', 'active', 'delayed', 'paused']);
    //     // for (const job of existingJobs) {
    //     //     if (job.id === jobId) {
    //     //         await job.remove();
    //     //     }
    //     // }
    //     await this.subscriptionQueue.add(
    //         jobId,
    //         {}, // Job data, if needed
    //         {
    //             // repeat: {
    //             //     every: 5 * 60 * 1000, // Run every 5 minute
    //             // },
    //             repeat: {
    //                 every: 24 * 60 * 60 * 1000, // Every 24 hours
    //                 startDate: new Date().setHours(0, 1, 0, 0), // Start at 12:01 AM
    //             }
    //         },
    //     );

    // }
}