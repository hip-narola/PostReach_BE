import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { ApprovalQueueController } from 'src/controllers/approval-queue/approval-queue.controller';
import { ApprovalQueueService } from 'src/services/approval-queue/approval-queue.service';
import { PostTask } from 'src/entities/post-task.entity';
import { BullQueueModule } from '../bull/bull-queue.module';
import { EmailService } from 'src/services/email/email.service';
import { NotificationModule } from '../notification/notification.module';
import { CheckUserSubscriptionService } from 'src/services/check-user-subscription/check-user-subscription.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostTask]),
    UnitOfWorkModule,
    BullQueueModule,
    NotificationModule],
  controllers: [ApprovalQueueController],
  providers: [ApprovalQueueService, CheckUserSubscriptionService, EmailService],
  exports: [ApprovalQueueService, CheckUserSubscriptionService],
})
export class ApprovalQueueModule { }