import { IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SocialMediaPlatform } from 'src/shared/constants/social-media.constants';

export class GetSocilInsightsParamDto {

    @ApiProperty({
        description: 'The days',
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    days: number;

    @ApiProperty({
        description: 'The Id of the login user',
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @ApiProperty({
        description: 'The platform of the user',
        type: Number,
    })
    @IsOptional()
    @IsIn(Object.values(SocialMediaPlatform))
    platform: number | null;
}