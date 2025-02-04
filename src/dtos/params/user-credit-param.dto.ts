import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsDate } from 'class-validator';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { Entity } from 'typeorm';

export class UserCreditDTO {
    @ApiProperty({
        description: 'The unique identifier of the user credit record',
        type: String,
    })
    @IsOptional()
    @IsString()
    id: string;

    @ApiProperty({
        description: 'The ID of the user associated with the credit',
        type: Number,
    })
    @IsOptional()
    @IsString()
    userId: number;

    @ApiProperty({
        description: 'The ID of the associated social media account',
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    socialMediaId: number;

    @ApiProperty({
        description: 'The ID of the associated subscription',
        type: String,
    })
    @IsOptional()
    @IsString()
    subscriptionId: string;

    @ApiProperty({
        description: 'The current credit amount',
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    currentCreditAmount: number;

    @ApiProperty({
        description: 'The start date of the credit',
        type: Date,
    })
    @IsOptional()
    @IsDate()
    startDate: Date;

    @ApiProperty({
        description: 'The end date of the credit',
        type: Date,
    })
    @IsOptional()
    @IsDate()
    endDate: Date;

    @ApiProperty({
        description: 'The cancel date of the credit',
        type: Date,
    })
    @IsOptional()
    @IsDate()
    cancelDate: Date;

    @ApiProperty({
        description: 'The last trigger date of the credit',
        type: Date,
    })
    @IsOptional()
    @IsDate()
    lastTriggerDate: Date;

    @ApiProperty({
        description: 'The status of the credit',
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    status: number;

    
    @ApiProperty({
        description: 'The associated social media account',
        type: Object,
    })
    @IsOptional()
    social_media: SocialMediaAccount;

}
