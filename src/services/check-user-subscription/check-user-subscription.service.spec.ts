import { Test, TestingModule } from '@nestjs/testing';
import { CheckUserSubscriptionService } from './check-user-subscription.service';

describe('CheckUserSubscriptionService', () => {
  let service: CheckUserSubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckUserSubscriptionService],
    }).compile();

    service = module.get<CheckUserSubscriptionService>(CheckUserSubscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
