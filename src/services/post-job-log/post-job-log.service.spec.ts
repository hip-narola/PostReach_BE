import { Test, TestingModule } from '@nestjs/testing';
import { PostJobLogService } from './post-job-log.service';

describe('PostJobLogService', () => {
  let service: PostJobLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostJobLogService],
    }).compile();

    service = module.get<PostJobLogService>(PostJobLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
