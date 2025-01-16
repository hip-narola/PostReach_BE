import { Injectable } from '@nestjs/common';
import { NotificationRepository } from 'src/repositories/notification-repository';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { Notification } from 'src/entities/notification.entity';
import { NotificationParamDto } from 'src/dtos/params/notification-param.dto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class NotificationService {
    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly unitOfWork: UnitOfWork,
    ) { }

    async getData(userId: number, isRead: boolean): Promise<Notification[]> {
        try {
            const notificationRepo = this.unitOfWork.getRepository(
                NotificationRepository,
                Notification,
                false
            );
            return await notificationRepo.findIsRead(userId, isRead);

        }
        catch (error) {
            throw new Error(`Failed to list notifications `);
        }
    }

    async saveData(userId: number, type: string, content: string): Promise<void> {
        try {
            // await this.unitOfWork.startTransaction();
            const notificationRepo = this.unitOfWork.getRepository(NotificationRepository, Notification, true);

            const notification = new Notification();
            notification.user_id = userId;
            notification.type = type;
            notification.content = content;
            notification.is_read = false;
            notification.created_at = new Date();
            notification.modified_at = new Date();

            await notificationRepo.create(notification);

            // await this.unitOfWork.completeTransaction();
            // return notification;
        }
        catch (error) {
            // await this.unitOfWork.rollbackTransaction();
            throw new Error(`error while creating notification: ${error}`);
        }
    }

    async updateData(userId: number, notificationId: number, isAllRead: boolean): Promise<Notification | Notification[]> {

        try {
            await this.unitOfWork.startTransaction();
            const notificationRepo = this.unitOfWork.getRepository(NotificationRepository, Notification, true);
            var record;
            if (!isAllRead && !notificationId) {
                throw new Error(`Please add either notification id or isAllRead param true`);
            }
            if (isAllRead) {

                record = await notificationRepo.findIsRead(userId, false);
                for (const data of record) {
                    data.is_read = true;
                    await notificationRepo.update(data.id, data);
                }
            }
            else {
                record = await notificationRepo.findOne(notificationId);
                if (!record) {
                    throw new Error(`Not found!`);
                }
                record.is_read = true;
                await notificationRepo.update(notificationId, record);
            }
            await this.unitOfWork.completeTransaction();
            return record;
        }
        catch (error) {
            await this.unitOfWork.rollbackTransaction();
            throw new Error(`${error}`);
        }
    }
}
