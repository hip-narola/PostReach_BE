import { Injectable } from '@nestjs/common';
import { PaginationParamDto } from 'src/dtos/params/pagination-param.dto';
import { PaginatedResponseDto } from 'src/dtos/response/pagination-response.dto';
import { Asset } from 'src/entities/asset.entity';
import { AssetArchive } from 'src/entities/asset_archive.entity';
import { PostJobLog } from 'src/entities/post-job-log.entity';
import { PostTask } from 'src/entities/post-task.entity';
import { Post } from 'src/entities/post.entity';
import { PostArchive } from 'src/entities/post_archive.entity';
import { AssetArchiveRepository } from 'src/repositories/asset-archive-repository';
import { AssetRepository } from 'src/repositories/asset-repository';
import { PostArchiveRepository } from 'src/repositories/post-archive-repository';
import { PostHistoryRepository } from 'src/repositories/post-history-repository';
import { PostRepository } from 'src/repositories/post-repository';
import { PostJobLogRepository } from 'src/repositories/postJobLog-repository';
import { generateId, IdType } from 'src/shared/utils/generate-id.util';
import { UnitOfWork } from 'src/unitofwork/unitofwork';

@Injectable()
export class PostHistoryService {

  constructor(
    private readonly unitOfWork: UnitOfWork
  ) { }

  async getPostHistoryList(paginatedParams: PaginationParamDto): Promise<PaginatedResponseDto> {
    const postHistoryRepository = this.unitOfWork.getRepository(PostHistoryRepository, PostTask, false);
    const data = await postHistoryRepository.getPostHistoryList(paginatedParams);
    return data;
  }


  async archivePosts(postIds: number[]): Promise<boolean> {
    await this.unitOfWork.startTransaction();
    try {
      const postRepository = this.unitOfWork.getRepository(PostRepository, Post, true);
      const assetRepository = this.unitOfWork.getRepository(AssetRepository, Asset, true);
      const postJobLogRepository = this.unitOfWork.getRepository(PostJobLogRepository, PostJobLog, true);
      const postTaskRepository = this.unitOfWork.getRepository(PostHistoryRepository, PostTask, true);
      const postArchiveRepository = this.unitOfWork.getRepository(PostArchiveRepository, PostArchive, true);
      const assetArchiveRepository = this.unitOfWork.getRepository(AssetArchiveRepository, AssetArchive, true);
      for (const postId of postIds) {
        const postRecord = await postRepository.findPostWithTask(postId);
        const assetRecord = await assetRepository.findAssetsByPostId(postId);

        const generatedIdForPostArchive = generateId(IdType.API_COUNTER);
        if (postRecord) {
          const postTaskRecord = await postTaskRepository.getPostTaskWithUserDetails(postRecord.postTask.id);
          const postJobLogRecord = await postJobLogRepository.findPostJobLogByPostTaskId(postRecord.postTask.id);
        
          const postArchive = new PostArchive();
          postArchive.id = generatedIdForPostArchive;
          postArchive.content = postRecord.content;
          postArchive.created_By = postRecord.created_By;
          postArchive.created_at = postRecord.created_at;
          postArchive.external_platform_id = postRecord.external_platform_id;
          postArchive.hashtags = postRecord.hashtags;
          postArchive.modified_By = postRecord.modified_By;
          postArchive.modified_date = postRecord.modified_date;
          postArchive.no_of_comments = postRecord.no_of_comments;
          postArchive.no_of_likes = postRecord.no_of_likes;
          postArchive.no_of_views = postRecord.no_of_views;
          postArchive.user = postTaskRecord.user;

          await postArchiveRepository.create(postArchive);


          if (assetRecord.length != 0) {
            for (const asset of assetRecord) {
              const generatedIdForAssetArchive = generateId(IdType.API_COUNTER);
              const assetArchive = new AssetArchive();

              assetArchive.created_By = asset.created_By;
              assetArchive.created_at = asset.created_at;
              assetArchive.id = generatedIdForAssetArchive;
              assetArchive.modified_By = asset.modified_By;
              assetArchive.modified_date = asset.modified_date;
              assetArchive.post = postArchive;
              assetArchive.type = asset.type;
              assetArchive.url = asset.url;
              await assetArchiveRepository.create(assetArchive);
            }

            for (const asset of assetRecord) {
              await assetRepository.delete(asset.id);
            }
          }
          await postRepository.delete(postId);
          if (postJobLogRecord) {
            await postJobLogRepository.delete(postJobLogRecord.id);
          }
          if (postTaskRecord) {
            await postTaskRepository.delete(postTaskRecord.id);
          }
        }
      }
      await this.unitOfWork.completeTransaction();
      return true;
    }
    catch (error) {

      await this.unitOfWork.rollbackTransaction();
      throw error;
    }

  }

}
