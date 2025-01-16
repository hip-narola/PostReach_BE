import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class UserDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsEmail()
	email: string;

	@IsOptional()
	@IsString()
	profilePicture?: string;

	@IsOptional()
	@IsString()
	profilePictureUrl?: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
