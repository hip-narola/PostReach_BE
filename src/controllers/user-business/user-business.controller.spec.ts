import { Test, TestingModule } from '@nestjs/testing';
import { UserBusinessController } from './user-business.controller';

describe('UserBusinessController', () => {
  let controller: UserBusinessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserBusinessController],
    }).compile();

    controller = module.get<UserBusinessController>(UserBusinessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
