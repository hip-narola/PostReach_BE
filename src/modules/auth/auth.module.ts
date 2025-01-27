import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from 'src/controllers/auth/auth.controller';
import { AuthService } from 'src/services/auth/auth.service';
import { EmailService } from 'src/services/email/email.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from 'src/shared/common/configurations/jwt/jwt.strategy';
import { JwtAuthGuard } from 'src/shared/common/guards/jwt/jwt.guard';
import { FacebookModule } from '../facebook/facebook.module';
import { CognitoIdentityService } from 'src/services/cognito-identity/cognito-identity.service';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { GoogleStrategyProvider } from 'src/shared/common/configurations/social/google.strategy.provider';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { FacebookStrategyProvider } from 'src/shared/common/configurations/social/facebook.strategy.provider';

@Module({
  imports: [PassportModule,ConfigModule,UserModule,FacebookModule],
  providers: [AuthService,GoogleStrategyProvider,EmailService,JwtStrategy,JwtAuthGuard,FacebookStrategyProvider,CognitoIdentityService,UnitOfWork,AwsSecretsService],
  controllers: [AuthController],
  exports: [AuthService,JwtAuthGuard,JwtStrategy,CognitoIdentityService],
})
export class AuthModule {}
