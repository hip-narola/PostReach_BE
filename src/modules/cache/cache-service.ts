import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis-service';

@Injectable()
export class CacheService {
    constructor(private readonly redisService: RedisService) {}

    async getCache(key: string): Promise<string | null> {
        return await this.redisService.get(key); // Reuse RedisService for Redis operations
    }

    async setCache(key: string, value: string): Promise<void> {
        await this.redisService.set(key, value); // Reuse RedisService for Redis operations
    }

    async deleteCache(key: string): Promise<number> {
        return await this.redisService.del(key); // Reuse RedisService for Redis operations
    }
}
