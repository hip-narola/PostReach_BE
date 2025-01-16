import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class ConnectedLinkedInPageParamDto {
    @ApiProperty({
        description: 'The userid of the user',
        type: Number,
    })
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @ApiProperty({
        description: 'Connected LinkedIn page ID',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    pageId: string;

    @ApiProperty({
        description: 'Connected platform',
        type: Number,
    })
    @IsNotEmpty()
    platform: number;

    @ApiProperty({
        description: 'Connected LinkedIn page or Account',
        type: String,
    })
    @IsNotEmpty()
    isPage: boolean;

    @ApiProperty({
        description: 'Connected LinkedIn page or account image',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    logoUrl: string;
}
