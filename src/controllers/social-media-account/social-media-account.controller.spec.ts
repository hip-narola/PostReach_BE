import { Test, TestingModule } from '@nestjs/testing';
import { SocialMediaAccountController } from './social-media-account.controller';

describe('SocialMediaAccountController', () => {
  let controller: SocialMediaAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialMediaAccountController],
    }).compile();

    controller = module.get<SocialMediaAccountController>(SocialMediaAccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
