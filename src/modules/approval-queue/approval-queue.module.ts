import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { ApprovalQueueController } from 'src/controllers/approval-queue/approval-queue.controller';
import { ApprovalQueueService } from 'src/services/approval-queue/approval-queue.service';
import { PostTask } from 'src/entities/post-task.entity';
import { BullQueueModule } from '../bull/bull-queue.module';
import { EmailService } from 'src/services/email/email.service';
import { NotificationModule } from '../notification/notification.module';
import { Logger } from 'src/services/logger/logger.service';
import { ApprovalQueueRepository } from 'src/repositories/approval-queue-repository';
import { PostTaskRepository } from 'src/repositories/post-task-repository';
import { RejectReasonRepository } from 'src/repositories/reject-reason-repository';
import { RejectReason } from 'src/entities/reject-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostTask, RejectReason]),
    UnitOfWorkModule,
    BullQueueModule,
    NotificationModule],
  controllers: [ApprovalQueueController],
  providers: [ApprovalQueueService, EmailService, ApprovalQueueRepository, PostTaskRepository, RejectReasonRepository, Logger],
  exports: [ApprovalQueueService, ApprovalQueueRepository, PostTaskRepository, RejectReasonRepository],
})
export class ApprovalQueueModule { }