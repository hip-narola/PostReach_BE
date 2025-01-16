import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { AwsSecretsService } from '../aws-secrets/aws-secrets.service';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';

@Injectable()
export class CognitoIdentityService {

    private cognitoISP: AWS.CognitoIdentityServiceProvider;
    private password = 'tXo{Eg$7Z8_;H%sA';
    private userPoolId: string;
    private appClientId: string;
    constructor(private readonly configService: ConfigService, private readonly secretService: AwsSecretsService) {
        this.cognitoISP = new AWS.CognitoIdentityServiceProvider({
            region: this.configService.get<string>('REGION'),
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
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: this.appClientId,
            AuthParameters: {
                USERNAME: userId,
                PASSWORD: this.password
            }
        };
        try {
            const response = await this.cognitoISP.initiateAuth(params).promise();
            return response.AuthenticationResult.AccessToken;
        } catch (error) {
            throw new Error('Failed to get ID Token from Cognito:' + error);
        }
    }

    // Create user in AWS
    async createUser(user: any): Promise<any> {
        const params = {
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
        };

        const setPasswordParams = {
            UserPoolId: this.userPoolId,
            Username: user.email,
            Password: this.password,
            Permanent: true,
        };

        try {
            const response = await this.cognitoISP.adminCreateUser(params).promise();
            await this.cognitoISP.adminSetUserPassword(setPasswordParams).promise();
            return response.User;
        } catch (error) {
            throw new Error('Failed to create user in cognito:' + error);
        }
    }
}