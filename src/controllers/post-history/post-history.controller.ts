import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { ArchivePostsDto } from 'src/dtos/params/archive-post-param.dto';
import { PaginationParamDto } from 'src/dtos/params/pagination-param.dto';
import { PaginatedResponseDto } from 'src/dtos/response/pagination-response.dto';
import { PostHistoryService } from 'src/services/post-history/post-history.service';

@Controller('post-history')
export class PostHistoryController {

    constructor(private readonly postHistoryService: PostHistoryService) { }

    @Post('getList')
    @ApiBody({ type: PaginationParamDto })
    async getPostHistoryList(@Body() PaginationParamDto: { limit: number; pageNumber: number, userId: number }): Promise<PaginatedResponseDto> {
        return await this.postHistoryService.getPostHistoryList(PaginationParamDto);
    }

    @Post('archive')
    @ApiBody({ type: ArchivePostsDto })
    async archivePosts(@Body() dto: ArchivePostsDto): Promise<object> {
        await this.postHistoryService.archivePosts(dto.postIds);
        return {
            message: 'Post are deleted successfully',
        };
    }

}
