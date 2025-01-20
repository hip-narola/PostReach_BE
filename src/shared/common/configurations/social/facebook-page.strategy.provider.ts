import { Provider } from '@nestjs/common';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { FacebookPageStrategy } from './FacebookPageStrategy.strategy';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';
import { Logger } from 'src/services/logger/logger.service';


export const FacebookPageStrategyProvider: Provider = {
  provide: FacebookPageStrategy,
  useFactory: async (secretService: AwsSecretsService) => {
    const data = await secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
    const appId = data.APP_ID_BUSINESS;
    const appSecret = data.APP_SECRET_BUSINESS;
    const strategy = data.FACEBOOK_PAGE_STRATEGY_CALLBACK
    const logger = new Logger()
    const message="Facebook page credentials:   "+ "appId:  "+appId+" appSecret:  "+appSecret+"  callBackUrl:  "+strategy;
    logger.log(message);
  
    return new FacebookPageStrategy(appId, appSecret, strategy, logger);
  },
  inject: [AwsSecretsService],
};
