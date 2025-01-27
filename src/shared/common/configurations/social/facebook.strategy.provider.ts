import { Provider } from '@nestjs/common';
import { FacebookStrategy } from './facebook.strategy';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { UserService } from 'src/services/user/user.service';
import { CognitoIdentityService } from 'src/services/cognito-identity/cognito-identity.service';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';
import { Logger } from 'src/services/logger/logger.service';

export const FacebookStrategyProvider: Provider = {
  provide: FacebookStrategy,
  useFactory: async (userService: UserService, cognitoIdentityService: CognitoIdentityService, unitOfWork: UnitOfWork, secretService: AwsSecretsService, logs: Logger) => {
    const data = await secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
    const appId = data.APP_ID
    const appSecret = data.APP_SECRET
    const facebookStartegy = "http://localhost:3000/auth/facebook/callback"
    const message = "Facebook page credentials:   " + "appId:  " + appId + " appSecret:  " + appSecret + "  callBackUrl:  " + facebookStartegy;
    logs.log(message);
    return new FacebookStrategy(userService, cognitoIdentityService, unitOfWork, appId, appSecret, facebookStartegy);
  },
  inject: [UserService, CognitoIdentityService, UnitOfWork, AwsSecretsService, Logger],
};
