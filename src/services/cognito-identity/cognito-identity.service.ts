import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsSecretsService } from '../aws-secrets/aws-secrets.service';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';
import { 
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { Logger } from '../logger/logger.service';

@Injectable()
export class CognitoIdentityService {

    private cognitoClient: CognitoIdentityProviderClient;
    private password = 'tXo{Eg$7Z8_;H%sA';
    private userPoolId: string;
    private appClientId: string;

    constructor(private readonly configService: ConfigService, private readonly secretService: AwsSecretsService,private readonly logger: Logger) {
        this.cognitoClient = new CognitoIdentityProviderClient({
            region: this.configService.get<string>('AWS_REGION'),
        });
        this.initialize();
    }

    private async initialize() {
        const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
        this.userPoolId = secretData?.USERPOOLID;
        this.appClientId = secretData?.APPCLIENTID;
        if (!this.userPoolId) {
            throw new Error('Missing necessary secret values: region, APPCLIENTID, or USERPOOLID');
        }
    }

    // Get access token from AWS by userId
    async getIdToken(userId: string): Promise<string> {
        const command = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: this.appClientId,
            AuthParameters: {
                USERNAME: userId,
                PASSWORD: this.password
            }
        });

        try {
            const response = await this.cognitoClient.send(command);
            return response.AuthenticationResult.AccessToken;
        } catch (error) {
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'getIdToken'
            );

            throw new Error('Failed to get ID Token from Cognito:' + error);
        }
    }

    // Create user in AWS
    async createUser(user: any): Promise<any> {
        const createUserCommand = new AdminCreateUserCommand({
            UserPoolId: this.userPoolId,
            Username: user.email,
            TemporaryPassword: this.password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: user.email,
                },
                {
                    Name: 'email_verified',
                    Value: 'true',
                },
            ],
            MessageAction: 'SUPPRESS',
        });

        const setPasswordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: this.userPoolId,
            Username: user.email,
            Password: this.password,
            Permanent: true,
        });

        try {
            const response = await this.cognitoClient.send(createUserCommand);
            await this.cognitoClient.send(setPasswordCommand);
            return response.User;
        } catch (error) {
            this.logger.error(
                `Error` +
                error.stack || error.message,
                'createUser'
            );

            throw new Error('Failed to create user in cognito:' + error);
        }
    }
}