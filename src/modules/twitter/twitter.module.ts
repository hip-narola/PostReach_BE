// twitter.module.ts
import { Module } from '@nestjs/common';
import { TwitterService } from 'src/services/twitter/twitter.service';
import { SocialMediaAccountModule } from '../social-media-account/social-media-account.module';
import { UserService } from 'src/services/user/user.service';
import { UserRepository } from 'src/repositories/userRepository';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { ImageUploadService } from 'src/services/image-upload/image-upload.service';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module'; // Import the module
import { NotificationModule } from '../notification/notification.module';
import { AwsSecretsServiceModule } from '../aws-secrets-service/aws-secrets-service.module';
import { CacheModule } from '../cache/cache-module';
import { Logger } from 'src/services/logger/logger.service';
import { Post } from 'src/entities/post.entity';
import { PostRepository } from 'src/repositories/post-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRepository, Post]),
    SocialMediaAccountModule,
    UnitOfWorkModule,
    QuestionnaireModule,
    NotificationModule,
    AwsSecretsServiceModule,
    CacheModule,
  ],
  providers: [TwitterService, UserService, ImageUploadService, Logger, PostRepository
  ],
  exports: [UserService],
})
export class TwitterModule { }
