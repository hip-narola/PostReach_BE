
import { IsBoolean, IsNotEmpty, IsString, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class NotificationSaveParamDto {
    @ApiProperty({
        description: 'The userID of the user',
        type: Number,
    })
    @IsNotEmpty()
    @IsString()
    userId: number;

    @ApiProperty({
        description: 'The post type',
        type: String,
    })
    @IsNotEmpty()
    type: string;

    @ApiProperty({
        description: 'The post content',
        type: String,
    })
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        description: 'is Read',
        type: Boolean,
    })
    @IsBoolean()
    @IsNotEmpty()
    isRead: boolean;
}
