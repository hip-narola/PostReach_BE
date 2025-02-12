import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


export enum UserInfoType {
    TEXT = 'text',
    LIST = 'list',
}

export enum Mode {
    AUTOPILOT = 'Autopilot',
    MANUAL = 'Manual',
}
export class SocialPostNumberDTO {
    @IsNotEmpty()
    @IsString()
    facebook_posts_number: number;

    @IsNotEmpty()
    @IsString()
    linkedin_posts_number: number;

    @IsNotEmpty()
    @IsString()
    twitter_posts_number: number;

    @IsNotEmpty()
    @IsString()
    instagram_posts_number: number;
}

export class UserInfoDTO {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    value: string;

    @IsEnum(UserInfoType)
    type: UserInfoType;

    @IsBoolean()
    is_url?: boolean;
}

export class GeneratePostPipelineRequestDTO {
    @IsOptional()
    @IsString()
    id?: string;

    @IsOptional()
    @IsEnum(Mode)
    mode?: Mode;

    @ValidateNested()
    @Type(() => SocialPostNumberDTO)
    @IsOptional()
    social_post_number?: SocialPostNumberDTO;

    @ValidateNested({ each: true })
    @Type(() => UserInfoDTO)
    @IsOptional()
    user_info?: UserInfoDTO[];

    @IsDateString()
    @IsOptional()
    schedule_start_date?: string;

    @IsDateString()
    @IsOptional()
    schedule_end_date?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsInt()
    idea_word_count?: number;

    @IsOptional()
    @IsString()
    pipeline_alias?: string;

    @IsOptional()
    @IsInt()
    draft_post_article_word_count?: number;

    @IsOptional()
    @IsInt()
    image_prompt_word_count?: number;

    @IsOptional()
    @IsInt()
    url_keyword_extraction_task_version?: number = 1;

    @IsOptional()
    @IsInt()
    idea_generation_task_version?: number = 1;

    @IsOptional()
    @IsInt()
    draft_post_generation_task_version?: number = 1;

    @IsOptional()
    @IsInt()
    image_prompt_generation_task_version?: number = 1;

    @IsOptional()
    @IsInt()
    facebook_social_task_version?: number = 1;

    @IsOptional()
    @IsInt()
    linkedin_social_task_version?: number = 1;

    @IsOptional()
    @IsInt()
    twitter_social_task_version?: number = 1;

    @IsOptional()
    @IsInt()
    instagram_social_task_version?: number = 1;


    @IsOptional()
    @IsInt()
    image_generation_task_version?: number = 1;

    @IsOptional()
    @IsBoolean()
    is_dummy?: boolean = false;
}

export class ReGeneratePostPipelineRequestDTO {
    @ValidateNested()
    @Type(() => PostTemplateDTO)
    @IsOptional()
    post_templates?: PostTemplateDTO[];

    @IsOptional()
    @IsBoolean()
    is_dummy?: boolean = false;
}

export class PostTemplateDTO {
    @IsNotEmpty()
    @IsString()
    post_id: number;

    @IsNotEmpty()
    @IsString()
    platform: string;

    image_generation?: {
        regenerate_prompt: boolean;
        regenerate_image: boolean;
    } = {
            regenerate_prompt: false,
            regenerate_image: false,
        };

    @IsString()
    language?: string;

    @IsString()
    text?: string;

    @IsOptional()
    @IsInt()
    social_task_version?: number = 0;

    @IsOptional()
    @IsInt()
    hashtag_number?: number = 0;

    @IsOptional()
    @IsInt()
    post_word_count?: number = 1000;

    @IsOptional()
    @IsInt()
    image_prompt_generation_task_version?: number = 1;

    @IsDateString()
    @IsOptional()
    schedule_start_date?: string;

    @IsDateString()
    @IsOptional()
    schedule_end_date?: string;
}
