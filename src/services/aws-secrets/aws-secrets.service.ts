import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { STS } from 'aws-sdk';
import { GlobalConfig } from 'src/config/global-config';
@Injectable()
export class AwsSecretsService {
    private readonly secretsManagerClient: SecretsManagerClient;
    private readonly sts: any;

    constructor(
        private configService: ConfigService) {
        AWS.config.update({
            region: this.configService.get<string>('REGION'),
        });
        this.sts = new STS();
        this.secretsManagerClient = new SecretsManagerClient({ region: "us-east-1" });
    }

    getSecret(secretName: string): Promise<{ [key: string]: string }> {
        const command = new GetSecretValueCommand({ SecretId: secretName, VersionStage: "AWSCURRENT" });
    
        return this.secretsManagerClient.send(command)
            .then((response) => {
                const secrets = response.SecretString ? JSON.parse(response.SecretString) : {};
                GlobalConfig.secrets = {
                    ...(GlobalConfig.secrets || {}),
                    [secretName]: secrets,
                };
    
                return secrets; // Return the secrets directly
            })
            .catch((error) => {
                return Promise.reject(error); // Return a rejected Promise with the error
            });
    }
    
    
}
