import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class NotificationUpdateQueryDto {
  @ApiProperty({
    description: 'Notification ID',
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  notificationId?: number;
}
