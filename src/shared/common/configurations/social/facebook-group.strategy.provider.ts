import { Provider } from '@nestjs/common';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { FacebookGroupStrategy } from './FacebookGroupStrategy.strategy';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';

export const FacebookGroupStrategyProvider: Provider = {
  provide: FacebookGroupStrategy,
  useFactory: async (secretService: AwsSecretsService) => {
    const data = await secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
    const appId = data.APP_ID_BUSINESS 
    const appSecret = data.APP_SECRET_BUSINESS 
    const  facebookStrategy= data.FACEBOOK_GROUP_STRATEGY_CALLBACK
    return new FacebookGroupStrategy(appId, appSecret,facebookStrategy);
  },
  inject: [AwsSecretsService],
};
