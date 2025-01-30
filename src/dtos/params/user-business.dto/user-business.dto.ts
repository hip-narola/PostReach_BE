import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserBusinessDto {
	// id: number;
	@ApiProperty({
		description: 'The ID of the user',
		type: Number,
	})
	@IsNotEmpty()
	@IsString()
	user_id: number;

	// @IsOptional()
	// @IsString()
	// image?: string;

	@ApiProperty({
		description: 'Image URL',
		type: String,
	})
	@IsString()
	@IsNotEmpty()
	image_url: string;

	@ApiProperty({
		description: 'Brand name',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	brand_name: string;

	@ApiProperty({
		description: 'location',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	location: string;

	@ApiProperty({
		description: 'website',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	website: string;
	
	@ApiProperty({
		description: 'use',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	use: string;

	@ApiProperty({
		description: 'overview',
		type: String,
	})
	@IsNotEmpty()
	@IsString()
	overview: string;

	// @ApiProperty({
	// 	description: 'Location',
	// 	type: String,
	// })
	// @IsNotEmpty()
	// @IsString()
	// location: string;
	
	// @ApiProperty({
    //     description: 'Primary goal',
    //     type: String,
    // })
    // @IsNotEmpty()
    // @IsString()
    // primary_goal: string;

	@ApiProperty({
		description: 'Created at timestamp',
		type: String, // Use `Date` type in model, but string format in the DTO
	})
	@IsNotEmpty()
	@IsDateString()
	created_at: Date;

	@ApiProperty({
		description: 'Updated at timestamp',
		type: String,
	})
	@IsNotEmpty()
	@IsDateString()
	updated_at: Date;

	@ApiProperty({
		description: 'Deleted at timestamp',
		type: String,
	})
	@IsOptional()
	@IsDateString()
	deleted_at?: Date;
}