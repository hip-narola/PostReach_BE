import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PostDTO {
    @IsOptional()
    @IsString()
    id: string;

    @IsOptional()
    @IsString()
    platform: string;

    @IsOptional()
    @IsString()
    language: string;

    @IsOptional()
    @IsOptional()
    @IsString()
    text: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    hashtags: string[];

    @IsOptional()
    @IsString()
    image_url: string;

    @IsOptional()
    @IsString()
    image_prompt: string;

    @IsOptional()
    @IsString()
    context: string;

    @IsOptional()
    @IsString()
    user_story: string;

    @IsOptional()
    @IsDateString()
    post_time: string;

    @IsOptional()
    @IsNumber()
    social_task_version: number;

    @IsOptional()
    @IsNumber()
    image_prompt_generation_task_version: number;

    @IsOptional()
    @IsNumber()
    post_word_count: number;

    @IsOptional()
    @IsNumber()
    image_prompt_word_count: number;

    @IsOptional()
    @IsNumber()
    hashtag_number: number;

    @IsOptional()
    @IsDateString()
    created_at: string;

    @IsOptional()
    @IsDateString()
    updated_at: string;

    @IsOptional()
    metadata: any;
}

export class generatePostResponseDTO {

    @IsOptional()
    @IsString()
    result_id: string;

    @IsOptional()
    @IsString()
    status: string;

    @IsOptional()
    @IsDateString()
    completed_at: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PostDTO)
    posts: PostDTO[];
}
