import { Module } from '@nestjs/common';
import { FacebookService } from 'src/services/facebook/facebook.service';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { SocialMediaAccountModule } from '../social-media-account/social-media-account.module';
import { ConfigModule } from '@nestjs/config';
import { AwsSecretsServiceModule } from '../aws-secrets-service/aws-secrets-service.module';

@Module({
    imports: [SocialMediaAccountModule,ConfigModule,AwsSecretsServiceModule],
    providers: [FacebookService, UnitOfWork],
    exports: [FacebookService],
})
export class FacebookModule { }
