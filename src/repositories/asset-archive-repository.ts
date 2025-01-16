import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';

import { AssetArchive } from 'src/entities/asset_archive.entity';

@Injectable()
export class AssetArchiveRepository extends GenericRepository<AssetArchive> {
    constructor(repository: Repository<AssetArchive>) {
        super(repository);
    }
}