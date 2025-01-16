import { Test, TestingModule } from '@nestjs/testing';
import { CognitoIdentityService } from './cognito-identity.service';

describe('CognitoIdentityService', () => {
  let service: CognitoIdentityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CognitoIdentityService],
    }).compile();

    service = module.get<CognitoIdentityService>(CognitoIdentityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
