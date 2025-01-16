import { Test, TestingModule } from '@nestjs/testing';
import { SocialMediaAccountService } from './social-media-account.service';

describe('SocialMediaAccountService', () => {
  let service: SocialMediaAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocialMediaAccountService],
    }).compile();

    service = module.get<SocialMediaAccountService>(SocialMediaAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
