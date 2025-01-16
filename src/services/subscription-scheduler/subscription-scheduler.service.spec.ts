import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionSchedulerService } from './subscription-scheduler.service';

describe('SubscriptionSchedulerService', () => {
  let service: SubscriptionSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionSchedulerService],
    }).compile();

    service = module.get<SubscriptionSchedulerService>(SubscriptionSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
