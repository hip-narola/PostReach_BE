import { GoogleStrategy } from './google.strategy';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { Provider } from '@nestjs/common';
import { UserService } from 'src/services/user/user.service';
import { CognitoIdentityService } from 'src/services/cognito-identity/cognito-identity.service';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';

export const GoogleStrategyProvider: Provider = {
    provide: GoogleStrategy,
    useFactory: async (cognitoIdentityService: CognitoIdentityService,
        userService: UserService, secretService: AwsSecretsService) => {
        const data = await secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
        const clientId = data.GOOGLE_CLIENT_ID;
        const clientSecret = data.GOOGLE_CLIENT_SECRET;
        const googleStrategy = data.GOOGLE_STRATEGY;
        return new GoogleStrategy(userService, cognitoIdentityService, secretService, clientId, clientSecret, googleStrategy);
    },
    inject: [UserService, CognitoIdentityService, AwsSecretsService],
};
