import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SchedulerService {
  constructor(@InjectQueue('hourly-scheduler-queue') private readonly schedulerQueue: Queue) { }

  async scheduleHourlyJob(): Promise<void> {

    const jobId = 'fetch-and-update-hourly';
    const existingJobs = await this.schedulerQueue.getJobs(['waiting', 'active', 'delayed', 'paused']);
    for (const job of existingJobs) {
      if (job.id === jobId) {
        await job.remove();
      }
    }

    await this.schedulerQueue.add(
      'fetch-and-update',
      {},
      {
        repeat: { every: 60 * 60 * 1000 },
        jobId,
      }
    );

  }
}
