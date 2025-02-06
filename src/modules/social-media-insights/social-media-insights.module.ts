import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { SocialMediaInsightsService } from 'src/services/social-media-insights/social-media-insights.service';
import { SocialMediaInsightsRepository } from 'src/repositories/social-media-insights-repository';
import { SocialMediaInsight } from 'src/entities/social-media-insights.entity';
import { DashboardInsightsModule } from '../dashboard-insights/dashboard-insights.module';
import { Logger } from 'src/services/logger/logger.service';

@Module({
    imports: [TypeOrmModule.forFeature([SocialMediaInsight]),
        UnitOfWorkModule,DashboardInsightsModule],
    providers: [SocialMediaInsightsService, SocialMediaInsightsRepository,Logger],
    controllers: [],
    exports: [SocialMediaInsightsService, SocialMediaInsightsRepository],
})
export class SocialMediaInsightsModule { }


