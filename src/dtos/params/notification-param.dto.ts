import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsBoolean } from 'class-validator';

export class NotificationParamDto {
    @ApiProperty({
        description: 'The userid of the user',
        type: Number,
    })
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @ApiProperty({
        description: 'is Read',
        type: Boolean,
    })
    @IsBoolean()
    @IsNotEmpty()
    isRead: boolean;
}