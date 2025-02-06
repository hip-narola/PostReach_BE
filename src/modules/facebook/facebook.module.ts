import { Module } from '@nestjs/common';
import { FacebookService } from 'src/services/facebook/facebook.service';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { SocialMediaAccountModule } from '../social-media-account/social-media-account.module';
import { ConfigModule } from '@nestjs/config';
import { AwsSecretsServiceModule } from '../aws-secrets-service/aws-secrets-service.module';
import { Logger } from 'src/services/logger/logger.service';

@Module({
    imports: [SocialMediaAccountModule,ConfigModule,AwsSecretsServiceModule],
    providers: [FacebookService, UnitOfWork,Logger],
    exports: [FacebookService],
})
export class FacebookModule { }
