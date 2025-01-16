import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/entities/question.entity';
import { QuestionOption } from 'src/entities/question-option.entity';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { OnboardingController } from 'src/controllers/onboarding/onboarding.controller';
import { OnboardingService } from 'src/services/onboarding/onboarding.service';
import { OnboardingRepository } from 'src/repositories/onboarding-repository';
@Module({
    imports: [TypeOrmModule.forFeature([Question, QuestionOption]),
        UnitOfWorkModule
    ],
    controllers: [OnboardingController],
    providers: [OnboardingService, OnboardingRepository],
    exports: [OnboardingService, OnboardingRepository],
})
export class OnboardingModule {
    
}
