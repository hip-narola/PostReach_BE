import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { UserBusiness } from './entities/user-business.entity';
import { SocialMediaAccount } from './entities/social-media-account.entity';
import { Questionnaire } from './entities/questionnaire.entity';
import { QuestionOption } from './entities/question-option.entity';
import { Question } from './entities/question.entity';
import { UserAnswer } from './entities/user-answer.entity';
import { QuestionValidator } from './entities/question-validator.entity';
import { PostTask } from './entities/post-task.entity';
import { Post } from './entities/post.entity';
import { PostJobLog } from './entities/post-job-log.entity';
import { Asset } from './entities/asset.entity';
import { RejectReason } from './entities/reject-reason.entity';
import { SocialMediaInsight } from './entities/social-media-insights.entity';
import { PostArchive } from './entities/post_archive.entity';
import { AssetArchive } from './entities/asset_archive.entity';
import { Notification } from './entities/notification.entity';
import { Subscription } from './entities/subscriptions.entity';
import { UserCredit } from './entities/user_credit.entity';
import { UserSubscription } from './entities/user_subscription.entity';
import { AwsSecretsService } from './services/aws-secrets/aws-secrets.service';
import { AWS_SECRET } from './shared/constants/aws-secret-name-constants';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
const secretsService = new AwsSecretsService(configService);
async function initializeAppDataSource() {
	const dbCredentials = await secretsService.getSecret(AWS_SECRET.AWSSECRETNAME);
  
	return new DataSource({
	  type: 'postgres',
	  host: dbCredentials.DB_HOST,
	  port: parseInt(dbCredentials.DB_PORT, 10),
	  username: dbCredentials.DB_USERNAME,
	  password: dbCredentials.DB_PASSWORD,
	  database: dbCredentials.DB_NAME,
	  entities: [User,UserBusiness, SocialMediaAccount, Questionnaire, Question, QuestionOption,UserAnswer,QuestionValidator,PostTask,Post,PostJobLog,Asset,RejectReason,SocialMediaInsight,PostArchive,AssetArchive,Subscription,UserCredit,UserSubscription,Notification], 
	  migrations: ['./dist/database/migrations/*.js'],
	  synchronize: false,
	  logging: true,
	});
  }
  
  export const AppDataSource = initializeAppDataSource();