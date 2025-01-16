import { CheckTokenExpiryGuard } from './check-token-expiry-guard.guard';
import { AuthService } from 'src/services/auth/auth.service'; 

describe('CheckTokenExpiryGuard', () => {
  let guard: CheckTokenExpiryGuard;
  let authService: AuthService;

  beforeEach(() => {
    authService = {
      isTokenExpired: jest.fn().mockResolvedValue(false), 
      getNewAccessToken: jest.fn().mockResolvedValue('new-access-token'), 
    } as any; 
    guard = new CheckTokenExpiryGuard(authService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
