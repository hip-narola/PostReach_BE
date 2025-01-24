import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';  // Added RedisClientType for type safety
import { AwsSecretsService } from './services/aws-secrets/aws-secrets.service';
import { AWS_SECRET } from './shared/constants/aws-secret-name-constants';

@Injectable()
export class RedisService implements OnApplicationShutdown, OnModuleInit {
  private client: RedisClientType | null = null;  // Redis client should be initially null
  private initialized = false; // Flag to check if Redis is initialized

  constructor(private readonly secretService: AwsSecretsService) {}

  async onModuleInit() {
    console.log('Redis connection onModuleInit calling...');
    // Initialize Redis client only once
    if (!this.initialized) {
      await this.initialize();
      this.initialized = true;
    }
  }

  async onApplicationShutdown() {
    // Ensure Redis connection is closed during app shutdown
    console.log('Application is shutting down...');
    await this.close();
  }

  private async initialize() {
    console.log('Redis connection initialize calling...');

    // Don't initialize if the client already exists
    if (this.client) {
      console.log('Redis client already initialized.');
      return;
    }

    const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);

    // Initialize the Redis client
    this.client = createClient({
      username: 'default',
      password: '4ijX6KOTVR6biLMpMIOu6H7qI40OIWcg', // secretData.REDIS_PASSWORD,
      socket: {
        host: 'redis-11619.c114.us-east-1-4.ec2.redns.redis-cloud.com', // secretData.REDIS_HOST,
        port: 11619, // parseInt(secretData.REDIS_PORT || '6379', 10)
      },
    });

    // Handle Redis client events
    this.client.on('end', async () => {
      console.log('Redis connection closed. Reconnecting...');
      await this.client.connect();
    });
    this.client.on('error', (err) => console.error('Redis Client Error', err));

    // Wait for the Redis client connection to be established
    await this.client.connect();
    console.log('Redis connection established.');
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis client not initialized');
    return await this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    if (!this.client) throw new Error('Redis client not initialized');
    await this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    if (!this.client) throw new Error('Redis client not initialized');
    return await this.client.del(key);
  }

  /**
   * Gracefully close the Redis connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit(); // Gracefully close the connection
      console.log('Redis connection closed.');
    }
  }
}
