import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { Asset } from 'src/entities/asset.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AssetRepository extends GenericRepository<Asset> {
	constructor(
		@InjectRepository(Asset)
		repository: Repository<Asset>) {
		super(repository);
	}

	async findAssetsByPostId(postId: number): Promise<Asset[]> {
		const assets = await this.repository.find({
			where: { post: { id: postId } }
		});
		return assets;
	}

}