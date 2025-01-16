import { IsArray, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SocialMediaPlatform } from 'src/shared/constants/social-media.constants';

export class FacebookPostParamDto {

    @ApiProperty({
        description: ' The page ID of the facebook',
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    pageId: number;

    @ApiProperty({
        description: 'The access token .',
        type: String,
    })
    @IsNotEmpty()
    @IsNumber()
    accessToken: String;

    @ApiProperty({
        description: 'The message to post',
        type: String,
    })
    @IsOptional()
    @IsIn(Object.values(SocialMediaPlatform))
    message: String | null;

    @ApiProperty({
        description: 'The URL of the image to include in the post.',
        type: String,
        required: false,
    })
    @IsOptional()
    imageUrl?: string;

    @ApiProperty({
        description: 'A list of hashtags to include in the post.',
        type: [String],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    hashtags?: string[];

}