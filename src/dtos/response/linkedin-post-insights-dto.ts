import { ApiProperty } from '@nestjs/swagger';

export class LinkedInPostInsightsDto {
    @ApiProperty({
        description: 'Total number of comments on the post',
    })
    comments: number;

    @ApiProperty({
        description: 'Total number of likes on the post',
    })
    likesSummary: number;
}
