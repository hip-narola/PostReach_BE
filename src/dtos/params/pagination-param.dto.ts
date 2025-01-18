import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationParamDto {
    @ApiProperty({
        description: 'The limit of the page',
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    limit: number;


    @ApiProperty({
        description: 'The page number',
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    pageNumber: number;

    @ApiProperty({
        description: 'The Id of the login user',
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    userId: number;
}