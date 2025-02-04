import { Test, TestingModule } from '@nestjs/testing';
import { GeneratePostService } from './generate-post.service';

describe('GeneratePostService', () => {
  let service: GeneratePostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneratePostService],
    }).compile();

    service = module.get<GeneratePostService>(GeneratePostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
