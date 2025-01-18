import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { Asset } from 'src/entities/asset.entity';

@Injectable()
export class AssetRepository extends GenericRepository<Asset> {
    constructor(repository: Repository<Asset>) {
        super(repository);
    }

    
    async findAssetsByPostId(postId: number): Promise<Asset[]> {
        const assets = await this.repository.find({
          where: { post: { id: postId } }
        });
        return assets;
      }

}