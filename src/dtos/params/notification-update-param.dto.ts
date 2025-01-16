
import { IsBoolean, IsNotEmpty, IsString, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class NotificationUpdateParamDto {
    @ApiProperty({
        description: 'The Id of the user',
        type: Number,
    })
    @IsNotEmpty()
    @IsString()
    userId: number;

    @ApiProperty({
        description: 'is All Read',
        type: Boolean,
    })
    @IsBoolean()
    @IsNotEmpty()
    isAllRead: boolean;
}
