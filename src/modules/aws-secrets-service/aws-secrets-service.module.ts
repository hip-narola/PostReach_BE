
import { Module } from '@nestjs/common';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';

@Module({
  providers: [AwsSecretsService],
  exports: [AwsSecretsService],
})
export class AwsSecretsServiceModule  {}
