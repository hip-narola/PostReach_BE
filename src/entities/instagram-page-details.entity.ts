import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InstagramPageDetailsDTO {
    @IsString()
    @IsOptional()
    access_token?: string | null;

    @IsString()
    @IsOptional()
    pageName?: string | null;

    @IsString()
    @IsOptional()
    instagramId?: string | null;

    @IsString()
    @IsOptional()
    logoUrl?: string | null;

    @IsBoolean()
    @IsNotEmpty()
    isPage: boolean;

    @IsOptional()
    userId?: number | null;

    @IsString()
    @IsOptional()
    faceBookId?: string | null;

    @IsString()
    @IsOptional()
    faceBookPageID?: string | null;

    @IsString()
    @IsOptional()
    facebook_Profile_access_token?: string | null;
}
