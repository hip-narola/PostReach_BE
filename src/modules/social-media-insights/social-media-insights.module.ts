import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialMediaAccountController } from 'src/controllers/social-media-account/social-media-account.controller';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { SocialMediaAccountService } from 'src/services/social-media-account/social-media-account.service';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';
import { SocialMediaInsightsService } from 'src/services/social-media-insights/social-media-insights.service';
import { SocialMediaInsightsRepository } from 'src/repositories/social-media-insights-repository';
import { SocialMediaInsight } from 'src/entities/social-media-insights.entity';
import { DashboardInsightsModule } from '../dashboard-insights/dashboard-insights.module';

@Module({
    imports: [TypeOrmModule.forFeature([SocialMediaInsight]),
        UnitOfWorkModule,DashboardInsightsModule],
    providers: [SocialMediaInsightsService, SocialMediaInsightsRepository],
    controllers: [],
    exports: [SocialMediaInsightsService, SocialMediaInsightsRepository],
})
export class SocialMediaInsightsModule { }


