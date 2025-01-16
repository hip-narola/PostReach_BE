import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class LikesCommentsViewsSchedulerService implements OnModuleInit {
  constructor(
    @InjectQueue('likesCommentsViewsScheduler') // Queue name matches module registration
    private readonly schedulerQueue: Queue
  ) { }

  async onModuleInit() {
    try {
      await this.scheduleHalfHourlyJobs();
    } catch (error) {
      throw error;
    }
  }

  private async scheduleHalfHourlyJobs() {
    const existingJobs = await this.schedulerQueue.getRepeatableJobs();
    const jobName = 'fetch-and-update-likes-comments-views';

    // Prevent duplicate job schedules
    if (existingJobs.some((job) => job.name === jobName)) {
      return;
    }

    await this.schedulerQueue.add(
      jobName,
      {}, // Empty payload for the job
      {
        repeat: {
          //   pattern: '0,30 * * * *', // Correct cron syntax for half-hourly schedule
          pattern: '*/5 * * * *',
          tz: 'UTC', // Optional timezone
        },
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

  }
}
