import { Test, TestingModule } from '@nestjs/testing';
import { DashboardInsightsService } from './dashboard-insights.service';

describe('DashboardInsightsService', () => {
  let service: DashboardInsightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardInsightsService],
    }).compile();

    service = module.get<DashboardInsightsService>(DashboardInsightsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
