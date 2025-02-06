import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GeneratePostService } from 'src/services/generate-post/generate-post.service';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { AwsSecretsService } from 'src/services/aws-secrets/aws-secrets.service';
import { SocialMediaAccountModule } from '../social-media-account/social-media-account.module';
import { UserModule } from '../user/user.module';
import { PostTaskRepository } from 'src/repositories/post-task-repository';
import { PostRepository } from 'src/repositories/post-repository';
import { AssetRepository } from 'src/repositories/asset-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostTask } from 'src/entities/post-task.entity';
import { Asset } from 'src/entities/asset.entity';
import { Post } from 'src/entities/post.entity';
import { UserCredit } from 'src/entities/user_credit.entity';
import { UserCreditRepository } from 'src/repositories/user-credit-repository';
import { UserRepository } from 'src/repositories/userRepository';
import { User } from 'src/entities/user.entity';
import { PostRetry } from 'src/entities/post-retry.entity';
import { PostRetryRepository } from 'src/repositories/post-retry-repository';
import { Logger } from 'src/services/logger/logger.service';

@Module({
    imports: [HttpModule, SocialMediaAccountModule, UserModule, TypeOrmModule.forFeature([PostTask, Post, Asset, UserCredit, User, PostRetry])],
    providers: [GeneratePostService, UnitOfWork, AwsSecretsService, PostTaskRepository, PostRepository, AssetRepository, UserCreditRepository, UserRepository, PostRetryRepository,Logger],
    exports: [GeneratePostService, AwsSecretsService, PostTaskRepository, PostRepository, AssetRepository, UserCreditRepository, UserRepository, PostRetryRepository],
})
export class GeneratePostModule { }
