import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeAccessTokenSchedulerService } from './exchange-access-token-scheduler-service.service';

describe('ExchangeAccessTokenSchedulerServiceService', () => {
  let service: ExchangeAccessTokenSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExchangeAccessTokenSchedulerService],
    }).compile();

    service = module.get<ExchangeAccessTokenSchedulerService>(ExchangeAccessTokenSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
