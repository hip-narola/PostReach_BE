import { Test, TestingModule } from '@nestjs/testing';
import { DashboardInsightsController } from './dashboard-insights.controller';

describe('DashboardInsightsController', () => {
  let controller: DashboardInsightsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardInsightsController],
    }).compile();

    controller = module.get<DashboardInsightsController>(DashboardInsightsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
