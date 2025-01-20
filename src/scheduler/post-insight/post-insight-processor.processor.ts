import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FacebookService } from '../../services/facebook/facebook.service';
import { LinkedinService } from '../../services/linkedin/linkedin.service';
import { TwitterService } from '../../services/twitter/twitter.service';
import { InstagramService } from '../../services/instagram/instagram.service';

@Processor('post-insight') // Queue name
export class PostInsightProcessor extends WorkerHost {
	constructor(private readonly facebookService: FacebookService,
		private readonly linkedinService: LinkedinService,
		private readonly twitterService: TwitterService,
		private readonly instagramService: InstagramService

	) {
		super(); // Call the constructor of WorkerHost
	}

	async process(job: Job) {
		try {
			//to-do
			//call if user has subscription
			await this.facebookService.fetchAndUpdatePostData();
			await this.instagramService.fetchAndUpdateInstagramPostData();
			await this.linkedinService.fetchAndUpdatePostData();
			await this.twitterService.fetchAndUpdateTwitterPostData();
		} catch (error) {
			throw error;
		}
	}
}
