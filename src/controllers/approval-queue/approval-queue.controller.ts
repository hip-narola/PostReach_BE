import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { PaginationParamDto } from 'src/dtos/params/pagination-param.dto';
import { PaginatedResponseDto } from 'src/dtos/response/pagination-response.dto';
import { ApprovalQueueService } from 'src/services/approval-queue/approval-queue.service';
import { UpdatePostTaskStatusDTO } from 'src/dtos/params/update-post-task-status.dto';
import { SubscriptionService } from 'src/services/subscription/subscription.service';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/shared/common/guards/jwt/jwt.guard';

@Controller('approval-queue')
@SkipThrottle()
export class ApprovalQueueController {
    constructor(private readonly approvalQueueService: ApprovalQueueService,
        private readonly subscriptionService: SubscriptionService
    ) { }
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
    @Post('updateStatus')
    @ApiBody({ type: UpdatePostTaskStatusDTO })
    async updateStatus(
        @Body()
        UpdatePostTaskStatusDTO: {
            id: number[];
            isApproved: boolean;
            rejectreasonId?: number;
            rejectReason?: string;
            userId: number;
        },
    ): Promise<any> {
        if (await this.subscriptionService.isUserSubscriptionExpire(UpdatePostTaskStatusDTO.userId)) {
            return {
                message: "Please subscribe a subscription first!",
            };
        }
        else {
            const data = await this.approvalQueueService.updateStatus(UpdatePostTaskStatusDTO);

            return {
                message: data
            };
        }
    }
    @UseGuards(JwtAuthGuard)
    @Get('RejectReasonList')
    async RejectReasonList(): Promise<any> {
        return await this.approvalQueueService.RejectReasonList();
    }
}
