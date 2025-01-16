import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { ApprovalQueueController } from 'src/controllers/approval-queue/approval-queue.controller';
import { ApprovalQueueService } from 'src/services/approval-queue/approval-queue.service';
import { PostTask } from 'src/entities/post-task.entity';
import { SchedulePostModule } from '../schedule-post/schedule-post.module';
import { EmailService } from 'src/services/email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostTask]),
  UnitOfWorkModule,SchedulePostModule],
  controllers: [ApprovalQueueController],
  providers: [ApprovalQueueService, EmailService],
  exports: [ApprovalQueueService],
})
export class ApprovalQueueModule {}