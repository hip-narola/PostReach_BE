import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ResetPasswordParamsDto {
	@ApiProperty({
		description: 'The email of the user',
		type: String,
	})
	@IsNotEmpty()
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
		description: 'The verification code of the user',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	code: string;

}
