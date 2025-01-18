
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ResetPasswordDto {
    @ApiProperty({
        description: 'The email of the user',
        type: String,
    })
    @IsNotEmpty()
    @IsEmail({}, { message: 'Invalid email format' })
    @IsString()
    email: string;

    @ApiProperty({
        description: 'The password of the user',
        type: String,
    })
    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    password: string;

    @ApiProperty({
        description: 'The new password of the user',
        type: String,
    })
    @IsNotEmpty({ message: 'Confirmation password is required' })
    @IsString()
    confirmPassword: string;
}
