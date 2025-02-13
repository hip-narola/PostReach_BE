import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePostTaskStatusDTO {
    @ApiProperty({
        description: 'The id of the post task table',
        type: [Number],
    })
    @IsNotEmpty()
    @IsNumber()
    id: number[];

    @ApiProperty({
        description: 'IsApproved',
        type: Boolean,
    })
    @IsNotEmpty()
    @IsString()
    isApproved: boolean;

    @ApiProperty({
        description: 'Rejection reason Id',
        type: Number,
    })
    @IsOptional()
    @IsString()
    rejectreasonId ?: number;

    @ApiProperty({
        description: 'Rejection reason',
        type: String,
    })
    @IsOptional()
	@IsString()
	rejectReason?: string;

    @ApiProperty({
        description: 'userId',
        type: Number,
    })
    
    @IsOptional()
    @IsNumber()
    userId: number;
}
