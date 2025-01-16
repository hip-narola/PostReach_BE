import { Test, TestingModule } from '@nestjs/testing';
import { CheckUserSubscriptionController } from './check-user-subscription.controller';

describe('CheckUserSubscriptionController', () => {
  let controller: CheckUserSubscriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckUserSubscriptionController],
    }).compile();

    controller = module.get<CheckUserSubscriptionController>(CheckUserSubscriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
