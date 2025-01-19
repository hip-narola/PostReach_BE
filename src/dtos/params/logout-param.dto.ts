
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, } from 'class-validator';

export class LogoutParamDto {
    @ApiProperty({
        description: 'The userid of the user',
        type: String,
    })
    @IsOptional()
    @IsString()
    accessToken?: string;
}