import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Repository } from 'typeorm';
import { PostArchive } from 'src/entities/post_archive.entity';

@Injectable()
export class PostArchiveRepository extends GenericRepository<PostArchive> {
    constructor(repository: Repository<PostArchive>) {
        super(repository);
    }
}