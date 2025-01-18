import {IsDateString, IsNotEmpty,IsNumber} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class CalenderParamDto {
  
    @ApiProperty({
        description: 'The start date of the week',
    })
    @IsNotEmpty()
    @IsDateString()
    startWeekDate: Date;

    @ApiProperty({
        description: 'The end date of the week',
    })
    @IsNotEmpty()
    @IsDateString()
    endWeekDate: Date;

    @ApiProperty({
        description: 'The Id of the login user',
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    userId: number;
}