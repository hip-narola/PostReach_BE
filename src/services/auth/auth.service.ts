import {
  CognitoIdentityClient,
  GetIdCommand,
  GetOpenIdTokenCommand,
} from '@aws-sdk/client-cognito-identity';
import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
  AuthFlowType
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import * as crypto from 'crypto';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';
import { promisify } from 'util';
import { AwsSecretsService } from '../aws-secrets/aws-secrets.service';
import { UserService } from '../user/user.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  private region: string;
  private appClientId: string;
  private userPoolId: string;
  private identityClient: CognitoIdentityClient;
  private identityPoolId: string;
  private cognitoClient: CognitoIdentityProviderClient;
  private userPool: CognitoUserPool;
  private resetTokens: Map<string, { token: string; expires: Date }> =
    new Map();
  private readonly cognitoBaseUrl: string;

  constructor(
    private configService: ConfigService,
    private readonly userService: UserService,
    private readonly secretService: AwsSecretsService,
  ) {
    this.identityClient = new CognitoIdentityClient({
      region: this.configService.get<string>('REGION'),
    });
    this.cognitoBaseUrl = `https://cognito-idp.us-east-1.amazonaws.com`;
    this.initialize();
  }

  private async initialize() {
    const secretData = await this.secretService.getSecret(
      AWS_SECRET.AWSSECRETNAME,
    );
    this.region = secretData?.REGION;
    this.appClientId = secretData?.APPCLIENTID;
    this.userPoolId = secretData?.USERPOOLID;
    this.identityPoolId = secretData?.IDENTITYPOOLID;
    if (!this.region || !this.appClientId || !this.userPoolId) {
      throw new Error(
        'Missing necessary secret values: region, APPCLIENTID, or USERPOOLID',
      );
    }
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.region,
    });
    this.userPool = new CognitoUserPool({
      UserPoolId: this.userPoolId,
      ClientId: this.appClientId,
    });
  }

  // AWS Cognito Sign-Up
  async signUp(
    firstName: string,
    email: string,
    password: string,
  ): Promise<any> {
    const command = new SignUpCommand({
      ClientId: this.appClientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'given_name', Value: firstName },
      ],
    });
    await this.cognitoClient.send(command);
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
    if (!userDetails) {
      const error = new Error('User not found.');
      error.name = 'UserNotFoundException';
      throw error;
    }
  /*
    const authenticateUserAsync = promisify(cognitoUser.authenticateUser.bind(cognitoUser));
  
    try {
      const result = await authenticateUserAsync(authenticationDetails);
      const expiresIn = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60; // 7 days for "Remember Me", 1 hour otherwise
      
      return {
        idToken: result.getIdToken().getJwtToken(),
        accessToken: result.getAccessToken().getJwtToken(),
        refreshToken: result.getRefreshToken().getToken(),
        expiresIn,
        rememberMe,
        userId: userDetails.id,
        userName: userDetails.name,
      };
    } catch (err) {
      throw err;
    }*/

      return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (result) => {
            const expiresIn = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60; // 7 days for "Remember Me", 1 hour otherwise
            resolve({
              idToken: result.getIdToken().getJwtToken(),
              accessToken: result.getAccessToken().getJwtToken(),
              refreshToken: result.getRefreshToken().getToken(),
              expiresIn, // Send expiration time along with the tokens
              rememberMe,
              userId: userDetails.id,
              userName: userDetails.name,
            });
          },
          onFailure: (err) => {
            reject(err);
          },
        });
      });
  }
  // AWS Cognito Confirm Sign-Up
  async confirmSignUp(
    email: string,
    confirmationCode: string,
    password: string,
  ): Promise<any> {
    const command = new ConfirmSignUpCommand({
      ClientId: this.appClientId,
      Username: email,
      ConfirmationCode: confirmationCode.trim(),
    });
    await this.cognitoClient.send(command);
    const signInResult = this.signIn(email, password, false);
    return signInResult;
  }

  // AWS Cognito  Sign-Up Resend Confirmation Code
  async ResendConfirmationCode(email: string): Promise<any> {
    const command = new ResendConfirmationCodeCommand({
      ClientId: this.appClientId,
      Username: email,
    });
    return await this.cognitoClient.send(command);
  }

  // AWS cognito forgot password
  async forgotPassword(email: string): Promise<any> {
    const userExists = await this.userService.findUserByEmail(email);
    if (!userExists) {
      throw new NotFoundException('Email does not exists. Please enter registered email.');
    }
    const command = new ForgotPasswordCommand({
      ClientId: this.appClientId,
      Username: email,
    });
    return await this.cognitoClient.send(command);
  }

  // AWS cognito reset password  service
  async resetPassword(
    email: string,
    password: string,
    code: string,
  ): Promise<any> {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: this.appClientId,
      Username: email,
      ConfirmationCode: code,
      Password: password,
    });
    return await this.cognitoClient.send(command);
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

  async globalSignOut(accessToken: string): Promise<void> {
    const url = this.cognitoBaseUrl;
    const headers = {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.GlobalSignOut',
    };

    const body = {
      AccessToken: accessToken,
    };

    try {
      await axios.post(url, body, { headers });
    } catch (error) {
      throw new Error(`Global sign-out failed: ${error.response?.data?.message || error.message}`);
    }
  }


  async refreshToken(refreshToken: string) {
    const params = {
      AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
      ClientId: this.appClientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    };

    try {
      const command = new InitiateAuthCommand(params);
      const response = await this.cognitoClient.send(command);

      return {
        accessToken: response.AuthenticationResult?.AccessToken,
        idToken: response.AuthenticationResult?.IdToken,
        expiresIn: response.AuthenticationResult?.ExpiresIn,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }



}
