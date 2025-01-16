import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class VerificationCodeParamsDto {
	@ApiProperty({
		description: 'The email of the user',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	email: string;
    
	@ApiProperty({
		description: 'The verification code of the user',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	code: string;

}
