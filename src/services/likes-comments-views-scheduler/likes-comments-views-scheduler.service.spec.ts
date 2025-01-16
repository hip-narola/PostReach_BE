import { Test, TestingModule } from '@nestjs/testing';
import { LikesCommentsViewsSchedulerService } from './likes-comments-views-scheduler.service';

describe('LikesCommentsViewsSchedulerService', () => {
  let service: LikesCommentsViewsSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LikesCommentsViewsSchedulerService],
    }).compile();

    service = module.get<LikesCommentsViewsSchedulerService>(LikesCommentsViewsSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
