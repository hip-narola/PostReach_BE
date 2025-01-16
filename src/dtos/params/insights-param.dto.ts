import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class InsightsParamDto {
    @ApiProperty({
        description: 'The userid of the user',
        type: Number,
    })
    @IsNumber()
    @IsNotEmpty()
    userid: number;

    @ApiProperty({
        description: 'The platform',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    platform: string;
}