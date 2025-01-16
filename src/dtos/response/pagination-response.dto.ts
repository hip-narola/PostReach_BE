import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto {
    @ApiProperty({
        description: 'Array of paginated items',
        type: [Object], // Replace `Object` with a specific type if needed
    })
    details: object;

    @ApiProperty({
        description: 'Total number of items',
        type: Number,
        example: 100,
    })
    totalCount: number;

    @ApiProperty({
        description: 'Total number of pages',
        type: Number,
        example: 10,
    })
    totalPages: number;

    @ApiProperty({
        description: 'Current page number',
        type: Number,
        example: 1,
    })
    currentPage: number;

    constructor(data: object, totalCount: number, totalPages: number, currentPage: number) {
        this.details = data;
        this.totalCount = totalCount;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
    }
}
