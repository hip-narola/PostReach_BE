
import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreditStatusType } from 'src/shared/constants/user-credit-status-constants';

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
                // .andWhere('userCredit.start_Date <= CURRENT_TIMESTAMP')
                // .andWhere('(userCredit.end_Date IS NULL OR userCredit.end_Date >= CURRENT_TIMESTAMP)')
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
        
        async findUniqueUserIds(isDisconnect: boolean = false): Promise<number[]> {
            try {
                const uniqueUserIds = await this.repository
                .createQueryBuilder('sma')
                .select('DISTINCT sma.user_id', 'user_id')
                .where('sma.isDisconnect = :isDisconnect', { isDisconnect })
                .getRawMany();

              console.log("socialMediaAccount uniqueUserIds:", uniqueUserIds);
              return uniqueUserIds.map(record => record.user_id);
          
            } catch (error) {
              console.error("Error fetching unique user IDs:", error);
              throw error; // Re-throw the error to be handled by the calling function
            }
          }
        
        async findPlatformsOfUser(userId: number): Promise<SocialMediaAccount[] | null> {
            return this.repository.find({ where: { user_id: userId } });
        }
    }