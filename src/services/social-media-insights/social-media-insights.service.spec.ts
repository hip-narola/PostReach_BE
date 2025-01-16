import { Test, TestingModule } from '@nestjs/testing';
import { SocialMediaInsightsService } from './social-media-insights.service';

describe('SocialMediaInsightsService', () => {
  let service: SocialMediaInsightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocialMediaInsightsService],
    }).compile();

    service = module.get<SocialMediaInsightsService>(SocialMediaInsightsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
