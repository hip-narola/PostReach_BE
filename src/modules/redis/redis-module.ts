import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis-service';
import { AwsSecretsServiceModule } from '../aws-secrets-service/aws-secrets-service.module';

@Global()
@Module({
    imports: [AwsSecretsServiceModule],
    providers: [RedisService],
    exports: [RedisService],
})
export class RedisModule {}
