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
      password: '4ijX6KOTVR6biLMpMIOu6H7qI40OIWcg', // secretData.REDIS_PASSWORD,
      socket: {
        host:  'redis-11619.c114.us-east-1-4.ec2.redns.redis-cloud.com',//secretData.REDIS_HOST,
        port: 11619//parseInt(secretData.REDIS_PORT || '6379', 10)
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