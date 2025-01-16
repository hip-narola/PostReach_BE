import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/entities/question.entity';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { QuestionnaireController } from 'src/controllers/questionnaire/questionnaire.controller';
import { QuestionnaireService } from 'src/services/questionnaire/questionnaire.service';
import { QuestionnaireRepository } from 'src/repositories/questionnaire-repository';
import { QuestionOption } from 'src/entities/question-option.entity';
import { Questionnaire } from 'src/entities/questionnaire.entity';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { UserAnswerRepository } from 'src/repositories/user-answer-repository';
import { UserAnswer } from 'src/entities/user-answer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Questionnaire, UserAnswer]),
        UnitOfWorkModule
    ],
    controllers: [QuestionnaireController],
    providers: [QuestionnaireService, QuestionnaireRepository, UserAnswerRepository],
    exports: [QuestionnaireService, QuestionnaireRepository, UserAnswerRepository],
})
export class QuestionnaireModule {

}
