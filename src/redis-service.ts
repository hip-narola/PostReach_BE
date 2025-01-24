import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import { AwsSecretsService } from './services/aws-secrets/aws-secrets.service';
import { AWS_SECRET } from './shared/constants/aws-secret-name-constants';

@Injectable()
export class RedisService implements OnApplicationShutdown, OnModuleInit {
  private client;

  constructor(private readonly secretService: AwsSecretsService) {}

  async onModuleInit() {
    // Proper lifecycle hook for initialization
    await this.initialize();
  }

  async onApplicationShutdown() {
    // Ensure Redis connection is closed during app shutdown
    console.log('Application is shutting down...');
    await this.close();
  }

  private async initialize() {
    const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);

    this.client = createClient({
      username: 'default',
      password: '4ijX6KOTVR6biLMpMIOu6H7qI40OIWcg', // secretData.REDIS_PASSWORD,
      socket: {
        host: 'redis-11619.c114.us-east-1-4.ec2.redns.redis-cloud.com', // secretData.REDIS_HOST,
        port: 11619, // parseInt(secretData.REDIS_PORT || '6379', 10)
      },
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
    await this.client.connect(); // Wait for connection to be established
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  /**
   * Close the Redis connection gracefully.
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit(); // Gracefully close the connection
      console.log('Redis connection closed.');
    }
  }
}
