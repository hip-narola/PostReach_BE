import { Processor, WorkerHost } from '@nestjs/bullmq';
import { FacebookService } from '../facebook/facebook.service';
import { Job } from 'bullmq';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';

@Processor('exchangeAccessTokenQueue') // Queue name
export class ExchangeAccessTokenWorker extends WorkerHost {
    constructor(private readonly unitOfWork: UnitOfWork, private readonly facebookService: FacebookService) {
        super(); // Call the constructor of WorkerHost to initialize the worker
    }

    // The 'process' method handles the job logic
    async process(job: Job) {
        const { accountId, shortLivedToken } = job.data;

        try {
            const longLivedToken = await this.facebookService.exchangeToLongLivedUserToken(shortLivedToken);

            const socialMediaAccountRepository = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, true);
            const record = await socialMediaAccountRepository.findOne(accountId);
            record.encrypted_access_token = longLivedToken;
            await socialMediaAccountRepository.update(accountId, record);
        } catch (error) {
           throw error;
        }
    }
}
