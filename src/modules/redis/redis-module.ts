import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis-service';
import { AwsSecretsServiceModule } from '../aws-secrets-service/aws-secrets-service.module';

@Global() // Ensures the module is globally available
@Module({
    imports: [AwsSecretsServiceModule], // Import AWS Secrets Service if required
    providers: [RedisService],
    exports: [RedisService], // Export RedisService to reuse it across other modules
})
export class RedisModule {}
