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
		console.log("post-insight initied:: ");
	}

	async process(job: Job) {
		console.log("post-insight started:: ", job);
		try {
			//to-do
			//call if user has subscription

			await this.facebookService.fetchAndUpdatePostData();
			await this.instagramService.fetchAndUpdateInstagramPostData();
			await this.linkedinService.fetchAndUpdatePostData();
			await this.twitterService.fetchAndUpdateTwitterPostData();
		} catch (error) {
			console.log("post-insight error:: ", error);
			throw error;
		}
	}
}
