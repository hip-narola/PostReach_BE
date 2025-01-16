
import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notification.entity';

@Injectable()
export class NotificationRepository extends GenericRepository<Notification> {

    constructor(
        @InjectRepository(Notification)
        repository: Repository<Notification>) {
        super(repository);
    }

    async findIsRead(userId: number, isRead: boolean): Promise<Notification[]> {
        return this.repository.find({
            where: {
                user_id: userId,
                is_read: isRead,
            },
        });
    }

}