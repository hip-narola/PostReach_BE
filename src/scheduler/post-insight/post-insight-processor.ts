import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { FacebookService } from '../../services/facebook/facebook.service';
import { LinkedinService } from '../../services/linkedin/linkedin.service';
import { TwitterService } from '../../services/twitter/twitter.service';
import { InstagramService } from '../../services/instagram/instagram.service';
import { PostRepository } from 'src/repositories/post-repository';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';

@Processor('post-insight') // Queue name
export class PostInsightProcessor extends WorkerHost {
	constructor(private readonly facebookService: FacebookService,
		private readonly linkedinService: LinkedinService,
		private readonly twitterService: TwitterService,
		private readonly instagramService: InstagramService,
		private readonly postRepository: PostRepository,

	) {
		super(); // Call the constructor of WorkerHost
	}

	async process(job: Job) {
		try {

			const posts = await this.postRepository.getPostsWithActiveSubscription();
			console.log("post-insight posts", posts);

			const facebookPosts = posts.filter(post =>
				post.postTask.socialMediaAccount.platform === SocialMediaPlatformNames[SocialMediaPlatform.FACEBOOK]
			);
			console.log("post-insight facebookPosts: ", facebookPosts);

			await this.facebookService.fetchAndUpdatePostData(facebookPosts);

			const instagramPosts = posts.filter(post =>
				post.postTask.socialMediaAccount.platform === SocialMediaPlatformNames[SocialMediaPlatform.INSTAGRAM]
			);
			await this.instagramService.fetchAndUpdateInstagramPostData(instagramPosts);


			const twitterPosts = posts.filter(post =>
				post.postTask.socialMediaAccount.platform === SocialMediaPlatformNames[SocialMediaPlatform.TWITTER]
			);
			await this.twitterService.fetchAndUpdateTwitterPostData(twitterPosts);

			const LinkedinPosts = posts.filter(post =>
				post.postTask.socialMediaAccount.platform === SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN]
			);
			await this.linkedinService.fetchAndUpdatePostData(LinkedinPosts);

		} catch (error) {
			console.log("post-insight error", error);
			throw error;
		}		 
	}
}
