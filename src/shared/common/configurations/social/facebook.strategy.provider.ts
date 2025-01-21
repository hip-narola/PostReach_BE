import { Provider } from '@nestjs/common';
import { FacebookStrategy } from './facebook.strategy';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { UserService } from 'src/services/user/user.service';
import { CognitoIdentityService } from 'src/services/cognito-identity/cognito-identity.service';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';

export const FacebookStrategyProvider: Provider = {
  provide: FacebookStrategy,
  useFactory: async (userService: UserService, cognitoIdentityService: CognitoIdentityService, unitOfWork: UnitOfWork, secretService: AwsSecretsService) => {
    const data = await secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
    const appId = data.APP_ID
    const appSecret = data.APP_SECRET
    const facebookStartegy = data.FACEBOOK_STRATEGY_CALLBACK
    return new FacebookStrategy(userService, cognitoIdentityService, unitOfWork, appId, appSecret, facebookStartegy);
  },
  inject: [UserService, CognitoIdentityService, UnitOfWork, AwsSecretsService],
};
