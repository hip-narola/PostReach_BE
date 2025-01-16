import { Provider } from '@nestjs/common';

import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { InstagramBusinessStrategy } from './InstagramBusinessStrategy.strategy';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';

export const InstagramBusinessStrategyProvider: Provider = {
  provide: InstagramBusinessStrategy,
  useFactory: async (secretService: AwsSecretsService) => {
    const data = await secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
    const appId = data.APP_ID_BUSINESS; 
    const appSecret = data.APP_SECRET_BUSINESS ;
    const strategy= data.INSTAGRAM_BUSINESS_STRATEGY_CALLBACK
    return new InstagramBusinessStrategy(appId, appSecret,strategy);
  },
  inject: [AwsSecretsService],
};
