import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FacebookService } from '../facebook/facebook.service';
import { LinkedinService } from '../linkedin/linkedin.service';
import { TwitterService } from '../twitter/twitter.service';
import { InstagramService } from '../instagram/instagram.service';

@Processor('likesCommentsViewsScheduler') // Queue name
export class LikesCommentsViewsSchedulerProcessor extends WorkerHost {
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
