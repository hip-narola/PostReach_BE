import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationUpdateQueryDto {
  @ApiProperty({
    description: 'Notification ID',
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  notificationId?: number;
}
