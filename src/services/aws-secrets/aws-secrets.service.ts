import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AwsSecretsService {
  private readonly secretsManagerClient: SecretsManagerClient;
  private secretCache = new Map<string, { [key: string]: string }>();

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const endpoint = this.configService.get<string>('AWS_ENDPOINT');
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    console.log('AWS Configuration:', region, endpoint, nodeEnv);
    this.secretsManagerClient = new SecretsManagerClient({
      region,
      ...(nodeEnv === 'local' && endpoint ? { endpoint } : {}),
    });
  }

  async getSecret(
    secretName: string,
    cache: boolean = true,
  ): Promise<{ [key: string]: string }> {
    try {
      if (cache && this.secretCache.has(secretName)) {
        return this.secretCache.get(secretName);
      }

      const command = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const response = await this.secretsManagerClient.send(command);
      const secretString = response.SecretString;

      if (!secretString) {
        throw new Error('Secret value is empty');
      }

      const parsedSecret = JSON.parse(secretString);

      if (cache) {
        this.secretCache.set(secretName, parsedSecret);
      }

      return parsedSecret;
    } catch (error) {
      throw new Error(`Failed to get secret: ${error.message}`);
    }
  }
}
