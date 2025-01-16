
import { IsNotEmpty, IsString, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SignUpDto {
	@ApiProperty({
		description: 'The username of the user',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	username: string;

	@ApiProperty({
		description: 'The email of the user',
		type: String,
	})
	@IsNotEmpty()
	email: string;

	@ApiProperty({
		description: 'The password of the user',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	password: string;
}
