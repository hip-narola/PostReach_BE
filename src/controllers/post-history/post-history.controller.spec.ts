import { Test, TestingModule } from '@nestjs/testing';
import { PostHistoryController } from './post-history.controller';

describe('PostHistoryController', () => {
  let controller: PostHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostHistoryController],
    }).compile();

    controller = module.get<PostHistoryController>(PostHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
