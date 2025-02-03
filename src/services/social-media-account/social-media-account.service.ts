import { Injectable } from '@nestjs/common';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';
import { SocialTokenDataDTO } from 'src/dtos/params/social-token-data-dto';
import { plainToInstance } from 'class-transformer';
import { UserCreditRepository } from 'src/repositories/user-credit-repository';
import { UserCredit } from 'src/entities/user_credit.entity';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';

@Injectable()
export class SocialMediaAccountService {
    constructor(
        private readonly socialMediaAccountRepository: SocialMediaAccountRepository,
        private readonly unitOfWork: UnitOfWork,
    ) { }

    async storeTokenDetails(userId: number, tokenData: SocialTokenDataDTO, platform: string): Promise<SocialMediaAccount> {
        await this.unitOfWork.startTransaction();
        try {
            tokenData.platform = platform;
            tokenData.user_id = userId;
            const data = plainToInstance(SocialMediaAccount, tokenData);
            data.connected_at = new Date();
            const socialMediaAccountRepo = this.unitOfWork.getRepository(
                SocialMediaAccountRepository,
                SocialMediaAccount,
                true
            );
            let updatedSocialMediaAccount;
            if (platform == SocialMediaPlatformNames[SocialMediaPlatform.FACEBOOK]) {

                const socialMediaAccountExists = await this.findSocialAccountOfUserForFacebook(userId, platform, tokenData.page_id, tokenData.facebook_Profile);
                if (!socialMediaAccountExists) {
                    // Create new account if it doesn't exist
                    updatedSocialMediaAccount = await socialMediaAccountRepo.create(data);
                }
                else {
                    // Update the existing account
                    data.updated_at = new Date();
                    await socialMediaAccountRepo.update(socialMediaAccountExists.id, data);
                    // After update, fetch the updated entity to return
                    updatedSocialMediaAccount = await socialMediaAccountRepo.findOne(socialMediaAccountExists.id);
                }
                await this.unitOfWork.completeTransaction();
                return updatedSocialMediaAccount;
            }
            else if (platform == SocialMediaPlatformNames[SocialMediaPlatform.INSTAGRAM]) {
                const socialMediaAccountExists = await this.findSocialAccountOfUserForInstagram(userId, platform, tokenData.instagram_Profile, tokenData.page_id, tokenData.facebook_Profile);
                if (!socialMediaAccountExists) {
                    // Create new account if it doesn't exist
                    updatedSocialMediaAccount = await socialMediaAccountRepo.create(data);
                }
                await this.unitOfWork.completeTransaction();
                return updatedSocialMediaAccount;
            }
            else if (platform == SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN]) {
                // const socialMediaAccountExists = await this.findSocialAccountOfUserForInstagram(userId, platform, tokenData.instagram_Profile, tokenData.page_id, tokenData.facebook_Profile);
                data.created_at = new Date();
                data.updated_at = null;
                const updatedSocialMediaAccount = await socialMediaAccountRepo.create(data);
                await this.unitOfWork.completeTransaction();
                return updatedSocialMediaAccount;
            }
            else {
                const socialMediaAccountExists = await this.findSocialAccountOfUser(userId, platform);
                if (!socialMediaAccountExists) {
                    // Create new account if it doesn't exist
                    updatedSocialMediaAccount = await socialMediaAccountRepo.create(data);
                } else {
                    data.updated_at = new Date();
                    // Update the existing account
                    await socialMediaAccountRepo.update(socialMediaAccountExists.id, data);
                    // After update, fetch the updated entity to return
                    updatedSocialMediaAccount = await socialMediaAccountRepo.findOne(socialMediaAccountExists.id);
                }
                await this.unitOfWork.completeTransaction();
                return updatedSocialMediaAccount;
            }
        } catch (error) {
            await this.unitOfWork.rollbackTransaction();
            throw error;
        }
    }

    async findSocialAccountOfUser(userId: number, platform: string): Promise<SocialMediaAccount | null> {
        const socialMediaAccountRepo = this.unitOfWork.getRepository(
            SocialMediaAccountRepository,
            SocialMediaAccount,
            true
        );
        const socialMediaAccount = await socialMediaAccountRepo.findByUserAndPlatform(userId, platform);
        return socialMediaAccount;

    }

    async findSocialAccountOfUserForFacebook(userId: number, platform: string, facebookpageId: string, facebook_Profile: string): Promise<SocialMediaAccount | null> {
        const socialMediaAccountRepo = this.unitOfWork.getRepository(
            SocialMediaAccountRepository,
            SocialMediaAccount,
            true
        );
        const socialMediaAccount = await socialMediaAccountRepo.findByUserAndPlatformAndFacebookId(userId, platform, facebookpageId, facebook_Profile);
        return socialMediaAccount;
    }

    async findSocialAccountOfUserForInstagram(userId: number, platform: string, instagramId: string, facebookpageId: string, facebook_Profile: string): Promise<SocialMediaAccount | null> {
        const socialMediaAccountRepo = this.unitOfWork.getRepository(
            SocialMediaAccountRepository,
            SocialMediaAccount,
            true
        );
        const socialMediaAccount = await socialMediaAccountRepo.findByUserAndPlatformAndInstagramId(userId, platform, instagramId, facebookpageId, facebook_Profile);
        return socialMediaAccount;
    }


    async socialLinks(userId: number): Promise<any> {
        try {
            return await this.socialMediaAccountRepository.findByFields({
                where: {
                    user_id: userId,
                    isDisconnect: false,
                },
                select: ['platform', 'encrypted_access_token', 'page_id', 'social_media_user_id'],
            });
        } catch (error) {
            throw error;
        }
    }
    async findSocialAccountOfUserForLinkedIn(userId: number, platform: string):
        Promise<SocialMediaAccount | null> {

        const socialMediaAccountRepo = this.unitOfWork.getRepository(
            SocialMediaAccountRepository,
            SocialMediaAccount,
            false
        );
        const socialMediaAccount = await socialMediaAccountRepo.findByUserAndPlatform(userId, platform);

        return socialMediaAccount;
    }

    async findSocialAccountForConnectAndDisconnectProfile(userId: number, platform: string, isDisconnect: boolean):
        Promise<SocialMediaAccount | null> {
        const socialMediaAccountRepo = this.unitOfWork.getRepository(
            SocialMediaAccountRepository,
            SocialMediaAccount,
            false
        );
        const socialMediaAccount = await socialMediaAccountRepo.findByUserAndPlatformAndisDiConnect(userId, platform, isDisconnect);

        return socialMediaAccount;
    }

    async findFirstSocialMediaAccountWithoutActiveCredit(
        userId: number
    ): Promise<string | null> {
        try {
            // Get repositories
            const socialMediaAccountRepository = this.unitOfWork.getRepository(
                SocialMediaAccountRepository,
                SocialMediaAccount,
                false
            );

            const userSubscriptionCreditRepository = this.unitOfWork.getRepository(
                UserCreditRepository,
                UserCredit,
                false
            );

            // Find all social media accounts for the user
            const userSocialAccounts = await socialMediaAccountRepository.findPlatformsOfUser(userId);

            if (!userSocialAccounts || userSocialAccounts.length === 0) {
                return null;
            }

            // Iterate over accounts and check for active credit
            for (const account of userSocialAccounts) {
                const activeCredit = await userSubscriptionCreditRepository.getUserCreditWithSocialMedia(
                    userId,
                    account.id
                );

                // Return the first account without active credit
                if (!activeCredit) {
                    return account.platform;
                }
            }

            // No accounts found without active credit
            return null;

        } catch (error) {
            throw error;
        }
    }    
}
