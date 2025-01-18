import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class ArchivePostsDto {

    @ApiProperty({
        description: 'The post table ids',
        type: [Number],

    })
    @IsArray()
    @IsInt({ each: true })
    postIds: number[];
}
