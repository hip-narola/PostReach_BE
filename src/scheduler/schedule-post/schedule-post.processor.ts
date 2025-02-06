import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ApprovalQueueService } from '../../services/approval-queue/approval-queue.service';
import { FacebookService } from '../../services/facebook/facebook.service';
import { LinkedinService } from '../../services/linkedin/linkedin.service';
import { InstagramService } from '../../services/instagram/instagram.service';
import { TwitterService } from '../../services/twitter/twitter.service';
import { SocialMediaPlatformNames, SocialMediaPlatform } from 'src/shared/constants/social-media.constants';
import { EmailService } from '../../services/email/email.service';
import { UserService } from '../../services/user/user.service';
import { EMAIL_SEND, EMAIL_SEND_FILE } from 'src/shared/constants/email-notification-constants';
import { POST_TASK_STATUS } from 'src/shared/constants/post-task-status-constants';
import { Logger } from 'src/services/logger/logger.service';

@Processor('post-queue')
export class SchedulePostProcessor extends WorkerHost {
	constructor(private readonly approvalQueueService: ApprovalQueueService,
		private readonly facebookService: FacebookService,
		private readonly linkedinService: LinkedinService,
		private readonly instagramService: InstagramService,
		private readonly twitterService: TwitterService,
		private readonly emailService: EmailService,
		private readonly userService: UserService,
		private readonly logger: Logger
	) {
		super();
	}

	async process(job: Job<any>): Promise<void> {
		const { Id, channel, PostId, accessToken, message, hashtags, imageUrl, pageId, SocialMediauserId, instagramId, userId } = job.data;
		try {
			// throw new Error('Failed to publish post');
			console.log("post-queue job.attemptsMade : ", job.attemptsMade);
			console.log("post-queue job Id : ", Id);
			switch (channel) {
				case `${SocialMediaPlatformNames[SocialMediaPlatform['FACEBOOK']]}`:
					console.log("post-queue postToFacebook ", PostId, pageId, accessToken, message, hashtags, imageUrl);
					await this.facebookService.postToFacebook(PostId, pageId, accessToken, message, hashtags, imageUrl);
					console.log("post-queue updateStatusAfterPostExecution ", Id, POST_TASK_STATUS.EXECUTE_SUCCESS);
					await this.approvalQueueService.updateStatusAfterPostExecution(Id, POST_TASK_STATUS.EXECUTE_SUCCESS, userId);
					break;

				case `${SocialMediaPlatformNames[SocialMediaPlatform['LINKEDIN']]}`:
					await this.linkedinService.postToLinkedIn(PostId, pageId, accessToken, SocialMediauserId, message, imageUrl, hashtags);
					await this.approvalQueueService.updateStatusAfterPostExecution(Id, POST_TASK_STATUS.EXECUTE_SUCCESS, userId);
					break;

				case `${SocialMediaPlatformNames[SocialMediaPlatform['INSTAGRAM']]}`:
					console.log("post-queue postToInstagram ", PostId, pageId, accessToken, message, hashtags, imageUrl);
					await this.instagramService.postToInstagram(PostId, instagramId, accessToken, imageUrl, message, hashtags);
					console.log("post-queue updateStatusAfterPostExecution ", Id, POST_TASK_STATUS.EXECUTE_SUCCESS);
					await this.approvalQueueService.updateStatusAfterPostExecution(
						Id, POST_TASK_STATUS.EXECUTE_SUCCESS, userId);
						
					break;

				case `${SocialMediaPlatformNames[SocialMediaPlatform['TWITTER']]}`:
					await this.twitterService.postToTwitter(PostId, pageId, accessToken, SocialMediauserId, message, imageUrl, hashtags);
					await this.approvalQueueService.updateStatusAfterPostExecution(Id, POST_TASK_STATUS.EXECUTE_SUCCESS, userId);
					break;
			}
		}
		catch (error) {
			console.log("post-queue error: ", error, job.attemptsMade);
			this.logger.error(
				`Error processing scheduled post for PostId: ${PostId}` +
				error.stack || error.message,
				'SchedulePostProcessor'
			);
			if (job.attemptsMade >= 4) {
				await this.approvalQueueService.updateStatusAfterPostExecution(Id, POST_TASK_STATUS.FAIL, userId);
				const user = await this.userService.findOne(userId);

				await this.emailService.sendEmail(user.email, EMAIL_SEND.POST_FAILED, EMAIL_SEND_FILE[EMAIL_SEND.POST_FAILED]);

				throw error;
			}
			throw error;
		}
	}
}
