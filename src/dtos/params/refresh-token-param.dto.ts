
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, } from 'class-validator';

export class RefreshTokenParamDto {
    @ApiProperty({
        description: 'The refresh token',
        type: String,
    })
    @IsOptional()
    @IsString()
    refreshToken?: string;
}