import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { FacebookService } from '../facebook/facebook.service';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';

@Injectable()
export class ExchangeAccessTokenSchedulerService implements OnModuleInit {
    constructor(
        private readonly unitOfWork: UnitOfWork,
        private readonly facebookService: FacebookService,
        @InjectQueue('exchangeAccessTokenQueue') private readonly exchangeAccessTokenQueue: Queue,
    ) { }

    async onModuleInit() {
        try {
            await this.scheduleTokenExchange();
        } catch (error) {
           throw error;
        }
    }

    private async scheduleTokenExchange() {
        const socialMediaAccountRepository = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, false);
        const facebookAccounts: SocialMediaAccount[] = await socialMediaAccountRepository.findByPlatform('facebook');

        if (!facebookAccounts || facebookAccounts.length === 0) {
            return; // Exit the method if no records are found
        }
        // Loop through each facebook account to check if token exchange is required
        for (const account of facebookAccounts) {
            const lastUpdated = account.updated_at;
            const daysSinceLastUpdate = this.calculateDaysSince(lastUpdated);

            // If 60 days have passed since last update, schedule the token exchange
            if (daysSinceLastUpdate >= 60) {
                // Schedule the task to exchange the access token
                await this.exchangeAccessTokenQueue.add('exchange-token', {
                    accountId: account.id, // Pass the account ID or relevant info to the task
                    shortLivedToken: account.encrypted_access_token, // Pass the current short-lived token
                });
            }
        }
    }

    private calculateDaysSince(date: Date): number {
        const now = new Date();
        const timeDiff = now.getTime() - date.getTime();
        return timeDiff / (1000 * 3600 * 24); // Convert milliseconds to days
    }
}
