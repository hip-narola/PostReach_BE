
import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SocialMediaAccountRepository extends GenericRepository<SocialMediaAccount> {

    constructor(

        @InjectRepository(SocialMediaAccount)
        repository: Repository<SocialMediaAccount>) {
        super(repository);
    }
    async findByUserAndPlatform(userId: number, platform: string): Promise<SocialMediaAccount | null> {
        return this.repository.findOne({
            where: {
                user_id: userId,
                platform: platform,
            },
        });
    }

    async findByUserAndPlatformAndisDiConnect(userId: number, platform: string, isDisconnect: boolean): Promise<SocialMediaAccount | null> {
        return this.repository.findOne({
            where: {
                user_id: userId,
                platform: platform,
                isDisconnect: isDisconnect
            },
        });
    }

    async findByPlatform(platform: string): Promise<SocialMediaAccount[] | null> {
        return this.repository.find({ where: { platform } });
    }

    async findListByUserAndPlatform(userId: number, platform: string): Promise<SocialMediaAccount[]> {
        return this.repository.find({
            where: {
                user_id: userId,
                platform: platform,
            },
        });
    }
    async findByUserAndPlatformAndFacebookId(userId: number, platform: string, facebookpageId: string, facebook_Profile: string): Promise<SocialMediaAccount | null> {
        return this.repository.findOne({
            where: {
                user_id: userId,
                platform: platform,
                page_id: facebookpageId,
                facebook_Profile: facebook_Profile
            },
        });
    }

    async findByUserAndPlatformAndInstagramId(userId: number, platform: string, instagramId: string, facebookpageId: string, facebook_Profile: string): Promise<SocialMediaAccount | null> {
        return this.repository.findOne({
            where: {
                user_id: userId,
                platform: platform,
                instagram_Profile: instagramId,
                page_id: facebookpageId,
                facebook_Profile: facebook_Profile
            },
        });
    }

    async findUniqueUserIds(): Promise<number[]> {
        const uniqueUserIds = await this.repository
            .createQueryBuilder('sma')
            .select('DISTINCT sma.user_id', 'user_id')
            .getRawMany();

        return uniqueUserIds.map(record => record.user_id);
    }

    async findPlatformsOfUser(userId: number): Promise<SocialMediaAccount[] | null> {
        return this.repository.find({ where: { user_id: userId } });
    }
}