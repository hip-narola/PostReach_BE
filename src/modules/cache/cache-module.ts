import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis-module';
import { CacheService } from './cache-service';

@Module({
    imports: [RedisModule], // Import RedisModule to reuse RedisService
    providers: [CacheService],
    exports: [CacheService], // Export CacheService for use in other modules
})
export class CacheModule {}
