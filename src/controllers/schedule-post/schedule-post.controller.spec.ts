import { Test, TestingModule } from '@nestjs/testing';
import { SchedulePostController } from './schedule-post.controller';

describe('SchedulePostController', () => {
  let controller: SchedulePostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulePostController],
    }).compile();

    controller = module.get<SchedulePostController>(SchedulePostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
