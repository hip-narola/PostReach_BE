import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as moment from 'moment';
import { REJECT_REASONS } from 'src/shared/constants/reject-reason-constants';
import { ApprovalQueueService } from 'src/services/approval-queue/approval-queue.service';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { PostTaskRepository } from 'src/repositories/post-task-repository';
import { UpdatePostTaskStatusDTO } from 'src/dtos/params/update-post-task-status.dto';

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
        private readonly unitOfWork: UnitOfWork,
        private readonly postTaskRepository: PostTaskRepository,
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
                    repeat: {
                        every: 10 * 60 * 1000, // Run every 5 minute
                    },
                    // repeat: {

                    //     every: 24 * 60 * 60 * 1000, // Every 24 hours
                    //     startDate: new Date().setHours(0, 1, 0, 0), // Start at 12:01 AM
                    // }
                    // repeat: {
                    //     pattern: '0 0 * * *', // Every 24 hours
                    // }
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
        const publishAt = moment(scheduleTime, 'YYYY-MM-DD HH:mm:ss');
        const delay = publishAt.diff(moment());

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
        expiredSubscriptions: { id: string, userId: number; endDate: Date; subscription: string; cycle: number }[]
    ) {
        try {
            const ids: number[] = [];

            for (let i = 0; i < expiredSubscriptions.length; i++) {
                const element = expiredSubscriptions[i];
                const posts = await this.postTaskRepository.fetchPostsofUser(element.id, element.userId);

                for (let i = 0; i < posts.length; i++) {
                    const data = posts[i];
                    ids.push(data.id); // Collect valid job IDs                
                }
            }
            if (ids.length > 0) {
                const jobs = await this.postQueue.getJobs(['delayed', 'waiting', 'active']);
                // console.log('post queue jobs: ', jobs);
                // Filter jobs to find the ones to be removed
                const filteredJobs = jobs.filter((job) => {
                    if (job && job.data) {
                        return ids.includes(job.data.Id); // Capture the filtered jobs
                    }
                });

                // Loop through each job and remove it from the queue
                for (const job of filteredJobs) {
                    try {
                        job.remove(); // Remove the job from the queue
                        console.log(`Job with ID ${job.id} removed from the queue.`);
                    } catch (error) {
                        console.error(`Failed to remove job with ID ${job.id}:`, error);
                    }
                }
                const postTaskStatusData: UpdatePostTaskStatusDTO = {
                    id: ids,
                    isApproved: false,
                    rejectreasonId: 7, // Subscription cancelled or expired
                    rejectReason: REJECT_REASONS[7],
                    userId: null
                };

                await this.approvalQueueService.updateStatus(postTaskStatusData);
            }
        } catch (error) {
            console.log('remove scheduler error::', error)
        }
    }

    private async scheduleDailyJob() {
        console.log("generatePostQueue : strated")
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
                    pattern: '*/10 * * * *',
                    // pattern: '0 0 * * *', // Cron pattern for daily at midnight
                    tz: 'UTC',
                },
                removeOnComplete: true,
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
                    pattern: '*/30 * * * *',
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
                removeOnComplete: true,
                removeOnFail: true,
                jobId,
            }
        );
    }
}