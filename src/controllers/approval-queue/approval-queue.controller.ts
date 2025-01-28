import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { PaginationParamDto } from 'src/dtos/params/pagination-param.dto';
import { PaginatedResponseDto } from 'src/dtos/response/pagination-response.dto';
import { ApprovalQueueService } from 'src/services/approval-queue/approval-queue.service';
import { UpdatePostTaskStatusDTO } from 'src/dtos/params/update-post-task-status.dto';

@Controller('approval-queue')
export class ApprovalQueueController {
    constructor(private readonly approvalQueueService: ApprovalQueueService) { }

    @Post('getList')
    @ApiBody({ type: PaginationParamDto })
    async getApprovalQueueList(
        @Body()
        PaginationParamDto: {
            limit: number;
            pageNumber: number;
            userId: number;
        },
    ): Promise<PaginatedResponseDto> {
        return await this.approvalQueueService.getApprovalQueueList(
            PaginationParamDto,
        );
    }

    @Post('updateStatus')
    @ApiBody({ type: UpdatePostTaskStatusDTO })
    async updateStatus(
        @Body()
        UpdatePostTaskStatusDTO: {
            id: number[];
            isApproved: boolean;
            rejectreasonId?: number;
            rejectReason?: string;
        },
    ): Promise<any> {
        const data = await this.approvalQueueService.updateStatus(
            UpdatePostTaskStatusDTO,
        );
        if (data == true) {
            return {
                message: 'Post(s) approved successfully.',
            };
        } else {
            return {
                message: 'Post(s) rejected successfully.',
            };
        }
    }

    @Get('RejectReasonList')
    async RejectReasonList(): Promise<any> {
        return await this.approvalQueueService.RejectReasonList();
    }
}
