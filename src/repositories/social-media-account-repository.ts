
import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreditStatusType } from 'src/shared/constants/user-credit-status-constants';
import { UserSubscriptionStatusType } from 'src/shared/constants/user-subscription-status-constants';

@Injectable()
export class SocialMediaAccountRepository extends GenericRepository<SocialMediaAccount> {

    constructor(

        @InjectRepository(SocialMediaAccount)
        repository: Repository<SocialMediaAccount>) {
        super(repository);
    }
    async findByPlatformAndUser(userId: number, platform: string): Promise<SocialMediaAccount | null> {
        return this.repository
            .createQueryBuilder('socialMediaAccount')
            .innerJoin('socialMediaAccount.userCredits', 'userCredit')
            .where('socialMediaAccount.platform = :platform', { platform })
            .andWhere('userCredit.user_id = :userId', { userId })
            .andWhere('userCredit.status = :status', { status: UserCreditStatusType.ACTIVE })
            .andWhere('userCredit.start_Date <= CURRENT_TIMESTAMP')
            .andWhere('(userCredit.end_Date IS NULL OR userCredit.end_Date >= CURRENT_TIMESTAMP)')
            .getOne();
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

    async findActiveCreditsByUser(userId: number, platform: string): Promise<SocialMediaAccount[]> {
        return this.repository
            .createQueryBuilder('socialMediaAccount')
            .innerJoin('socialMediaAccount.userCredits', 'userCredit')
            .where('socialMediaAccount.platform = :platform', { platform })
            .andWhere('userCredit.user_id = :userId', { userId })
            .andWhere('userCredit.status = :status', { status: UserCreditStatusType.ACTIVE })
            // .andWhere('userCredit.start_Date <= CURRENT_TIMESTAMP')
            // .andWhere('(userCredit.end_Date IS NULL OR userCredit.end_Date >= CURRENT_TIMESTAMP)')
            .getMany();
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

    async getActiveSocialMediaAccountAsync(): Promise<SocialMediaAccount[]> {
        return this.repository.createQueryBuilder('account')
            .andWhere('account.isDisconnect = :isDisconnect', { isDisconnect: false }) // Filter active accounts
            .andWhere(
                `EXISTS (
                    SELECT 1 FROM user_subscription us
                    WHERE us.user_id = account.user_id
                    AND us.status IN (:...statuses)
                )`,
                { statuses: [UserSubscriptionStatusType.ACTIVE, UserSubscriptionStatusType.TRIAL] }
            )
            .select([
                'account.id',
                'account.token_type',
                'account.encrypted_access_token',
                'account.refresh_token',
                'account.facebook_Profile_access_token',
                'account.encryption_key_id',
                'account.expires_in',
                'account.scope',
                'account.platform',
                'account.user_id', 
                'account.connected_at',
                'account.page_id',
                'account.instagram_Profile',
                'account.facebook_Profile',
                'account.name',
                'account.user_name',
                'account.user_profile',
                'account.file_name',
                'account.social_media_user_id',
                'account.isDisconnect',
                'account.created_at',
                'account.updated_at'
            ])
            .distinctOn(['account.user_id'])
            .getMany();
    }
    

    async findPlatformsOfUser(userId: number): Promise<SocialMediaAccount[] | null> {
        return this.repository.find({ where: { user_id: userId } });
    }

    async findByPlatformAndConnected(platform: string): Promise<SocialMediaAccount[] | null> {
        return this.repository.find({ where: { platform, isDisconnect: false } });
    }
}