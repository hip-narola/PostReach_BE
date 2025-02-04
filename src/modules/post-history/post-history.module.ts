import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitOfWorkModule } from '../unit-of-work.module';
import { PostTask } from 'src/entities/post-task.entity';
import { PostHistoryController } from 'src/controllers/post-history/post-history.controller';
import { PostHistoryService } from 'src/services/post-history/post-history.service';
import { GeneratePostModule } from '../generate-post/generate-post.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostTask]),
    UnitOfWorkModule, GeneratePostModule],
  controllers: [PostHistoryController],
  providers: [PostHistoryService],
})
export class PostHistoryModule { }