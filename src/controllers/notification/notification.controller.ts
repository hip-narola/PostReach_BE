import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { NotificationService } from 'src/services/notification/notification.service';
import { Notification } from 'src/entities/notification.entity';
import { NotificationSaveParamDto } from 'src/dtos/params/notification-save-param.dto';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { NotificationUpdateParamDto } from 'src/dtos/params/notification-update-param.dto';
import { NotificationUpdateQueryDto } from 'src/dtos/params/notification-query-param.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService
    ) { }

    @Throttle({ default: { limit: 10, ttl: 30 } })
    @Get('getList/:userId/:isRead')
    async getList(@Param('userId') userId: number, @Param('isRead') isRead: boolean): Promise<Notification[]> {
        try {
            const data = await this.notificationService.getData(userId, isRead);
            return data;
        } catch (error) {
            throw new Error(`Data not found.${error}`);
        }
    }

    @Post('save')
    @ApiBody({ type: NotificationSaveParamDto })
    async create(@Body() notificationSaveParamDto: NotificationSaveParamDto): Promise<void> {
        try {
            const { userId, type, content } = notificationSaveParamDto;
            await this.notificationService.saveData(userId, type, content);
        } catch (error) {
            throw new Error(`Error while creating notification: ${error.message}`);
        }
    }

    @Post('update')
    @ApiBody({ type: NotificationUpdateParamDto })
    @ApiQuery({ name: 'notificationId', required: false, type: Number, description: 'Optional Notification ID' })

    async updateNotification(
        @Body() notificationUpdateParamDto: NotificationUpdateParamDto,
        @Query() query: NotificationUpdateQueryDto) {
        try {
            const { notificationId } = query;
            const { userId, isAllRead } = notificationUpdateParamDto;
            return await this.notificationService.updateData(userId, notificationId, isAllRead);
        } catch (error) {
            throw new Error(`Error while updating notification: ${error.message}`);
        }
    }
}