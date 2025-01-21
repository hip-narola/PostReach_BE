import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FacebookConnectProfileParamDto {
    @ApiProperty({
        description: 'access token of the facebook page',
        type: String,
    })
    @IsString()
    access_token: string;

    @ApiProperty({
        description: 'facebook page name',
        type: String,
    })
    @IsString()
    pageName?: string;


    @ApiProperty({
        description: 'Facebook profile id',
        type: String,
    })
    @IsString()
    faceBookId?: string;

    @ApiProperty({
        description: 'Instagram id',
        type: String,
    })
    @IsString()
    instagramId?: string;

    @ApiProperty({
        description: 'Facebook page image file path',
        type: String,
    })
    @IsString()
    filePath?: string;

    @ApiProperty({
        description: 'facebook Profile access token',
        type: String,
    })
    @IsString()
    facebook_Profile_access_token?: string;
}