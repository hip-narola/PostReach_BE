import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notification.entity';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { NotificationController } from 'src/controllers/notification/notification.controller';
import { NotificationService } from 'src/services/notification/notification.service';
import { NotificationRepository } from 'src/repositories/notification-repository';
import { Logger } from 'src/services/logger/logger.service';

@Module({
    imports: [TypeOrmModule.forFeature([Notification]), UnitOfWorkModule],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationRepository, Logger],
    exports: [NotificationService],
})
export class NotificationModule { }
