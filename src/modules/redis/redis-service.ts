import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { AWS_SECRET } from '../../shared/constants/aws-secret-name-constants';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';

@Injectable()
export class RedisService implements OnApplicationShutdown, OnModuleInit {
    private client: RedisClientType | null = null;

    constructor(private readonly secretService: AwsSecretsService) { }

    async onModuleInit() {
        if (!this.client) {
            await this.initialize();
        }
    }

    async onApplicationShutdown() {
        await this.close();
    }

    private async initialize() {
        const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
        this.client = createClient({
            username: 'default',
            password: '4ijX6KOTVR6biLMpMIOu6H7qI40OIWcg', //secretData.REDIS_PASSWORD,
            socket: {
                host: 'redis-11619.c114.us-east-1-4.ec2.redns.redis-cloud.com',//secretData.REDIS_HOST,
                port: 11619, //parseInt(secretData.REDIS_PORT || '6379', 10),
            },
        });

        this.client.on('error', (err) => console.error('Redis Client Error:', err));
        await this.client.connect();
        console.log('Redis connection established.');
    }

    async get(key: string): Promise<string | null> {
        if (!this.client) throw new Error('Redis client is not initialized');
        return await this.client.get(key);
    }

    async set(key: string, value: string): Promise<void> {
        if (!this.client) throw new Error('Redis client is not initialized');
        await this.client.set(key, value);
    }

    async del(key: string): Promise<number> {
        if (!this.client) throw new Error('Redis client is not initialized');
        return await this.client.del(key);
    }

    async close(): Promise<void> {
        if (this.client) {
            await this.client.quit();
        }
    }
}