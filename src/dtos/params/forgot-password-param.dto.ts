import {IsNotEmpty,IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class ForgotPasswordParamDto {
    @ApiProperty({
        description: 'The email of the user',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    email: string;
}