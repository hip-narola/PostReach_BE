import { Test, TestingModule } from '@nestjs/testing';
import { PostHistoryService } from './post-history.service';

describe('PostHistoryService', () => {
  let service: PostHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostHistoryService],
    }).compile();

    service = module.get<PostHistoryService>(PostHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
