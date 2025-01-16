import { InstagramAuthGuard } from './instagram-auth.guard';

describe('InstagramAuthGuard', () => {
  it('should be defined', () => {
    expect(new InstagramAuthGuard()).toBeDefined();
  });
});
