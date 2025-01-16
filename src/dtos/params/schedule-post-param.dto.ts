import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class SchedulePostDto {
    @ApiProperty({
        description: 'The page id of the page',
        type: Number,
    })
    @IsString()
    @IsNotEmpty()
    postid: Number;

    @ApiProperty({
        description: 'The page title of the page',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'The post content of the page',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    postContent: string;

    @ApiProperty({
        description: 'The scheduled date',
        type: Date,
    })
    @IsDateString()
    @IsNotEmpty()
    scheduleDate: Date;
}
