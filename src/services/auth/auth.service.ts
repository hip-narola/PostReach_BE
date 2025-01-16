import {
	CognitoIdentityProviderClient,
	ConfirmSignUpCommand,
	SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoUser, CognitoUserPool, AuthenticationDetails } from 'amazon-cognito-identity-js';
import axios from 'axios';
import { promisify } from 'util';
import * as crypto from 'crypto';
import * as AWS from 'aws-sdk';
import { UserService } from '../user/user.service';
import { CognitoIdentityClient, GetIdCommand, GetOpenIdTokenCommand } from '@aws-sdk/client-cognito-identity';
import { AwsSecretsService } from '../aws-secrets/aws-secrets.service';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';

@Injectable()
export class AuthService {
	private region: string;
	private appClientId: string;
	private userPoolId: string;
	private identityClient: CognitoIdentityClient;
	private identityPoolId: string;
	private cognito: AWS.CognitoIdentityServiceProvider;
	private client: CognitoIdentityProviderClient;
	private userPool: CognitoUserPool;
	private resetTokens: Map<string, { token: string; expires: Date }> =
		new Map();

	constructor(
		private configService: ConfigService, private readonly userService: UserService, private readonly secretService: AwsSecretsService) {
		this.identityClient = new CognitoIdentityClient({
			region: this.configService.get<string>('REGION'),
		});


		this.initialize();
	}



	private async initialize() {
		const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
		this.region = secretData?.REGION;
		this.appClientId = secretData?.APPCLIENTID;
		this.userPoolId = secretData?.USERPOOLID;
		this.identityPoolId = secretData?.IDENTITYPOOLID;
		if (!this.region || !this.appClientId || !this.userPoolId) {
			throw new Error('Missing necessary secret values: region, APPCLIENTID, or USERPOOLID');
		}
		this.client = new CognitoIdentityProviderClient({ region: this.region });
		this.cognito = new AWS.CognitoIdentityServiceProvider({
			region: this.region,
		});
		this.userPool = new CognitoUserPool({
			UserPoolId: this.userPoolId,
			ClientId: this.appClientId,
		});

	}

	// AWS Cognito Sign-Up
	async signUp(firstName: string, email: string, password: string): Promise<any> {
		const command = new SignUpCommand({
			ClientId: this.appClientId,
			Username: email,
			Password: password,
			UserAttributes: [{ Name: 'email', Value: email },
			{ Name: 'given_name', Value: firstName },
			],
		});
		await this.client.send(command);
		return { Name: firstName };
	}

	// AWS Cognito Sign-In
	async signIn(email: string, password: string, rememberMe: boolean): Promise<any> {
		const authenticationDetails = new AuthenticationDetails({
			Username: email.toLowerCase(),
			Password: password,
		});
		const cognitoUser = new CognitoUser({
			Username: email.toLowerCase(),
			Pool: this.userPool,
		});
		const userDetails = await this.userService.findUserByEmail(email.toLowerCase());
		if (userDetails == null) {
			const error = new Error("User is not confirmed.");
			error.name = 'UserNotConfirmedException';
			throw error;
		}
		const authenticateUser = promisify(cognitoUser.authenticateUser.bind(cognitoUser));
		return new Promise((resolve, reject) => {
			cognitoUser.authenticateUser(authenticationDetails, {
				onSuccess: (session) => {
					const expiresIn = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60; // 7 days for "Remember Me", 1 hour otherwise
					resolve({
						idToken: session.getIdToken().getJwtToken(),
						accessToken: session.getAccessToken().getJwtToken(),
						refreshToken: session.getRefreshToken().getToken(),
						expiresIn, // Send expiration time along with the tokens
						rememberMe,
						userId: userDetails.id,
						userName: userDetails.name
					});
				},
				onFailure: (err) => {
					reject(err);
				},
			});
		});
	}

	// AWS Cognito Confirm Sign-Up
	async confirmSignUp(email: string, confirmationCode: string, password: string): Promise<any> {
		const command = new ConfirmSignUpCommand({
			ClientId: this.appClientId,
			Username: email,
			ConfirmationCode: confirmationCode.trim(),
		});
		const result = await this.client.send(command);
		const signInResult = this.signIn(email, password, false);
		return signInResult;
	}

	// AWS Cognito  Sign-Up Resend Confirmation Code
	async ResendConfirmationCode(email: string): Promise<any> {
		const params = {
			ClientId: this.appClientId,
			Username: email,
		};
		return await this.cognito.resendConfirmationCode(params).promise();
	}

	// AWS cognito forgot password
	async forgotPassword(email: string): Promise<any> {
		const userExists = await this.userService.findUserByEmail(email);
		if (!userExists) {
			throw new NotFoundException('User is not exist');
		}
		const params = {
			ClientId: this.appClientId,
			Username: email,
		};
		return await this.cognito.forgotPassword(params).promise();
	}

	// AWS cognito reset password  service
	async resetPassword(email: string, password: string, code: string): Promise<any> {
		const params = {
			ClientId: this.appClientId,
			Username: email,
			ConfirmationCode: code,
			Password: password,
		};
		return await this.cognito.confirmForgotPassword(params).promise();
	}

	//generate reset token
	async generateResetToken(email: string): Promise<string> {
		const token = crypto.randomBytes(20).toString('hex');
		const expires = new Date();
		expires.setHours(expires.getHours() + 1); // Token expires in 1 hour
		this.resetTokens.set(email, { token, expires });
		return token;
	}



	async federatedSignIn(provider: 'google' | 'facebook', token: string) {
		const logins = {
			google: 'accounts.google.com',
			facebook: 'graph.facebook.com',
		};

		// Get Cognito Identity ID
		const getIdCommand = new GetIdCommand({
			IdentityPoolId: this.identityPoolId,
			Logins: { [logins[provider]]: token },
		});
		const identityResponse = await this.identityClient.send(getIdCommand);

		// Get OpenID Token
		const getTokenCommand = new GetOpenIdTokenCommand({
			IdentityId: identityResponse.IdentityId,
			Logins: { [logins[provider]]: token },
		});
		const tokenResponse = await this.identityClient.send(getTokenCommand);

		return {
			accessToken: tokenResponse.Token,
			identityId: tokenResponse.IdentityId,
		};
	}

}





