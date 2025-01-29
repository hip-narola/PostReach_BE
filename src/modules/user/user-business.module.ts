import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { UserBusiness } from 'src/entities/user-business.entity';
import { UserBusinessController } from 'src/controllers/user-business/user-business.controller';
import { UserBusinessService } from 'src/services/user-business/user-business.service';
import { ImageUploadModule } from 'src/src/modules/image-upload/image-upload.module';
import { UserBusinessRepository } from 'src/repositories/userBusinessRepository';
import { Repository } from 'typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([UserBusiness, Repository]),
        UnitOfWorkModule,
        ImageUploadModule
    ],
    controllers: [UserBusinessController],
    providers: [UserBusinessService, UserBusinessRepository],
    exports: [UserBusinessService, UserBusinessRepository],
})
export class UserBusinessModule { }