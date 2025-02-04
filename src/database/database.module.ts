import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsSecretsService } from '../services/aws-secrets/aws-secrets.service';
import { AWS_SECRET } from '../shared/constants/aws-secret-name-constants';
import { User } from '../entities/user.entity';
import { UserBusiness } from '../entities/user-business.entity';
import { SocialMediaAccount } from '../entities/social-media-account.entity';
import { Questionnaire } from '../entities/questionnaire.entity';
import { Question } from '../entities/question.entity';
import { QuestionOption } from '../entities/question-option.entity';
import { UserAnswer } from '../entities/user-answer.entity';
import { QuestionValidator } from '../entities/question-validator.entity';
import { PostTask } from '../entities/post-task.entity';
import { Post } from '../entities/post.entity';
import { PostJobLog } from '../entities/post-job-log.entity';
import { Asset } from '../entities/asset.entity';
import { RejectReason } from '../entities/reject-reason.entity';
import { SocialMediaInsight } from '../entities/social-media-insights.entity';
import { PostArchive } from '../entities/post_archive.entity';
import { AssetArchive } from '../entities/asset_archive.entity';
import { Subscription } from '../entities/subscriptions.entity';
import { UserCredit } from '../entities/user_credit.entity';
import { UserSubscription } from '../entities/user_subscription.entity';
import { Notification } from '../entities/notification.entity';
import { AwsSecretsServiceModule } from 'src/modules/aws-secrets-service/aws-secrets-service.module';
import { PostRetry } from 'src/entities/post-retry.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [AwsSecretsServiceModule],
      inject: [AwsSecretsService],
      useFactory: async (secretsService: AwsSecretsService) => {
        const dbCredentials = await secretsService.getSecret(
          AWS_SECRET.AWSSECRETNAME,
        );

        return {
          type: 'postgres',
          host: dbCredentials.DB_HOST,
          port: parseInt(dbCredentials.DB_PORT, 10),
          username: dbCredentials.DB_USERNAME,
          password: dbCredentials.DB_PASSWORD,
          database: dbCredentials.DB_NAME,
          timezone: 'Z', // This ensures UTC timezone
          entities: [
            User,
            UserBusiness,
            SocialMediaAccount,
            Questionnaire,
            Question,
            QuestionOption,
            UserAnswer,
            QuestionValidator,
            PostTask,
            Post,
            PostJobLog,
            Asset,
            RejectReason,
            SocialMediaInsight,
            PostArchive,
            AssetArchive,
            Subscription,
            UserCredit,
            UserSubscription,
            Notification,
            PostRetry
          ],
          migrations: ['./dist/database/migrations/*.js'],
          synchronize: false,
          logging: true,
          pool: {
            max: 50,
            min: 10,
            acquire: 30000,
            idle: 10000
          },
        };
      },
    }),
  ],
})
export class DatabaseModule { }
