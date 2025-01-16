import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostToInstagramDto {

  @ApiProperty({
    description: 'The post ID',
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  postId: number;


  @ApiProperty({
    description: 'The Instagram User ID',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  igUserId: string;

  @ApiProperty({
    description: 'The access token for Instagram',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @ApiProperty({
    description: 'The URL of the image to be posted',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @ApiProperty({
    description: 'The content of the post (optional)',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'List of hashtags for the post (optional)',
    type: [String],
    required: false,
  })
  @IsOptional()
  hashtags?: string[];
}
