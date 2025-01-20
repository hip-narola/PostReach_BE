import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LinkedInTokenParamDto {
    @ApiProperty({
        description: 'LinkedIn token_type',
        type: String,
    })
    @IsString()
    token_type: string;

    @ApiProperty({
        description: 'LinkedIn encrypted_access_token',
        type: String,
    })
    @IsString()
    encrypted_access_token: string;

    @ApiProperty({
        description: 'LinkedIn refresh_token',
        type: String,
    })
    @IsString()
    refresh_token?: string;

    
    @ApiProperty({
        description: 'LinkedIn refresh_token_expire_in',
        type: String,
    })
    @IsString()
    refresh_token_expire_in?: string;

    @ApiProperty({
        description: 'LinkedIn encryption_key_id',
        type: String,
    })
    @IsString()
    encryption_key_id?: string;

    @ApiProperty({
        description: 'LinkedIn expires_in',
        type: String,
    })
    @IsString()
    expires_in: string;

}