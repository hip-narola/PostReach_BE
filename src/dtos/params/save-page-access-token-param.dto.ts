import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SavePageAccessTokenParams {
	@ApiProperty({
		description: 'The page id of the page',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	pageId: string;

	@ApiProperty({
		description: 'The page access token of the page',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	pageAccessToken: string;


	@ApiProperty({
		description: 'The platform of the page',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	platform: string;

	
	@ApiProperty({
		description: 'The facebook id of the user',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	facebookId: string;
}
