import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { AwsSecretsService } from './services/aws-secrets/aws-secrets.service';
import { AWS_SECRET } from './shared/constants/aws-secret-name-constants';

@Injectable()
export class RedisService {
  private client;


  constructor(private readonly secretService: AwsSecretsService) {
    this.initialize();

  }

  private async initialize() {
    const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
    this.client = createClient({
      username: "default",
      password: secretData.REDIS_PASSWORD,
      socket: {
        host: secretData.REDIS_HOST,
        port: parseInt(secretData.REDIS_PORT || '6379', 10)
      }

    });

    // TODO: Remove console error logs
    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client.connect();
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async set(key: string, value: string) {
    return await this.client.set(key, value);
  }

  async del(key: string) {
    return await this.client.del(key);
  }

  // Add other Redis operations as needed
}