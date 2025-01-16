import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialMediaAccountController } from 'src/controllers/social-media-account/social-media-account.controller';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { SocialMediaAccountService } from 'src/services/social-media-account/social-media-account.service';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';

@Module({
    imports: [TypeOrmModule.forFeature([SocialMediaAccount]),
        UnitOfWorkModule],
    providers: [SocialMediaAccountService, SocialMediaAccountRepository],
    controllers: [SocialMediaAccountController],
    exports: [SocialMediaAccountService, SocialMediaAccountRepository],
})
export class SocialMediaAccountModule { }


