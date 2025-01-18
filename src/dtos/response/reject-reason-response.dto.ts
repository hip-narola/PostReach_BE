import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RejectReasonResponseDTO {
    @ApiProperty({
        description: 'The id of the reject reason table',
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({
        description: 'reason',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    reason: string;
}
