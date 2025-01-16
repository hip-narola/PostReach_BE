import { Test, TestingModule } from '@nestjs/testing';
import { AwsSecretsService } from './aws-secrets.service';

describe('AwsSecretsService', () => {
  let service: AwsSecretsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsSecretsService],
    }).compile();

    service = module.get<AwsSecretsService>(AwsSecretsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
