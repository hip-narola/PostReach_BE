import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalQueueController } from './approval-queue.controller';

describe('ApprovalQueueController', () => {
    let controller: ApprovalQueueController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ApprovalQueueController],
        }).compile();

        controller = module.get<ApprovalQueueController>(
            ApprovalQueueController,
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
