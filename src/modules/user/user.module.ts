import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from 'src/controllers/user/user.controller';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/services/user/user.service';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { UserBusinessModule } from './user-business.module';
import { UserBusiness } from 'src/entities/user-business.entity';
import { UserBusinessController } from 'src/controllers/user-business/user-business.controller';
import { UserBusinessService } from 'src/services/user-business/user-business.service';
import { ImageUploadModule } from 'src/src/modules/image-upload/image-upload.module';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module'; // Import QuestionnaireModule

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserBusiness]),
    UserBusinessModule,
    UnitOfWorkModule,
    ImageUploadModule,
    QuestionnaireModule
  ],
  controllers: [UserController, UserBusinessController],
  providers: [UserService, UserBusinessService],
  exports: [UserService],
})
export class UserModule {}
