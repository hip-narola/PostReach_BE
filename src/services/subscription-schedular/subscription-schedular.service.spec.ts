import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionSchedularService } from './subscription-schedular.service';

describe('SubscriptionSchedularService', () => {
  let service: SubscriptionSchedularService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionSchedularService],
    }).compile();

    service = module.get<SubscriptionSchedularService>(SubscriptionSchedularService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
