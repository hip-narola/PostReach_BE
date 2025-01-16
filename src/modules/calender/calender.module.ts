import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { ApprovalQueueController } from 'src/controllers/approval-queue/approval-queue.controller';
import { ApprovalQueueService } from 'src/services/approval-queue/approval-queue.service';
import { PostTask } from 'src/entities/post-task.entity';
import { CalenderController } from 'src/controllers/calender/calender.controller';
import { CalenderService } from 'src/services/calender/calender.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostTask]),
  UnitOfWorkModule],
  controllers: [CalenderController],
  providers: [CalenderService],
})
export class CalenderModule {}