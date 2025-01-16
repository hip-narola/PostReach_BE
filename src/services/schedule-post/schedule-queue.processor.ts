import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ApprovalQueueService } from '../approval-queue/approval-queue.service';
import { FacebookService } from '../facebook/facebook.service';
import { LinkedinService } from '../linkedin/linkedin.service';
import { InstagramService } from '../instagram/instagram.service';
import { TwitterService } from '../twitter/twitter.service';
import { SocialMediaPlatformNames, SocialMediaPlatform } from 'src/shared/constants/social-media.constants';
import { NotificationService } from '../notification/notification.service';
import { NotificationMessage, NotificationType } from 'src/shared/constants/notification-constants';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import { EMAIL_SEND, EMAIL_SEND_FILE } from 'src/shared/constants/email-notification-constants';

@Processor('post-queue')
export class PostProcessor extends WorkerHost {
	constructor(private readonly approvalQueueService: ApprovalQueueService,
		private readonly facebookService: FacebookService,
		private readonly linkedinService: LinkedinService,
		private readonly instagramService: InstagramService,
		private readonly twitterService: TwitterService,
		private readonly notificationService: NotificationService,
		private readonly emailService: EmailService,
		private readonly userService: UserService,

	) {
		super();
	}

	async process(job: Job<any>): Promise<void> {
		const { Id, channel, PostId, accessToken, message, hashtags, imageUrl, pageId, SocialMediauserId, scheduleTime, instagramId, userId } = job.data;
		try {
			// throw new Error('Failed to publish post');
			switch (channel) {
				case 'facebook':
					const publishFacebookPost = await this.facebookService.postToFacebook(PostId, pageId, accessToken, message, hashtags, imageUrl);
					const data = await this.approvalQueueService.updateStatusAfterPostExecution(Id, "Execute_Success");
					await this.notificationService.saveData(userId, NotificationType.POST_PUBLISHED, NotificationMessage[NotificationType.POST_PUBLISHED]);

					break;

				case `${SocialMediaPlatformNames[SocialMediaPlatform['LINKEDIN']]}`:
					const publishLinkedinPost = await this.linkedinService.postToLinkedIn(PostId, pageId, accessToken, SocialMediauserId, message, imageUrl, hashtags);
					const dataUpdate = await this.approvalQueueService.updateStatusAfterPostExecution(Id, "Execute_Success");
					await this.notificationService.saveData(userId, NotificationType.POST_PUBLISHED, NotificationMessage[NotificationType.POST_PUBLISHED]);
					break;

				case 'instagram':
					const publishInstagramPost =
						await this.instagramService.postToInstagram(PostId, instagramId, accessToken, imageUrl, message, hashtags);
					const detailsUpdate = await this.approvalQueueService.updateStatusAfterPostExecution(
						Id, 'Execute_Success');
					await this.notificationService.saveData(userId, NotificationType.POST_PUBLISHED, NotificationMessage[NotificationType.POST_PUBLISHED]);
					break;

				case `${SocialMediaPlatformNames[SocialMediaPlatform['TWITTER']]}`:
					const publisTwitterPost = await this.twitterService.postToTwitter(PostId, pageId, accessToken, SocialMediauserId, message, imageUrl, hashtags);
					const dataUpdateTitter = await this.approvalQueueService.updateStatusAfterPostExecution(Id, "Execute_Success");
					await this.notificationService.saveData(userId, NotificationType.POST_PUBLISHED, NotificationMessage[NotificationType.POST_PUBLISHED]);
					break;
			}
		}
		catch (error) {
			if (job.attemptsMade >= 4) {
				await this.approvalQueueService.updateStatusAfterPostExecution(Id, "Fail");
				await this.notificationService.saveData(userId, NotificationType.POST_FAILED, NotificationMessage[NotificationType.POST_FAILED]);
				const user = await this.userService.findOne(userId);
				// await this.emailService.sendEmail(user.email, EMAIL_SEND.POST_FAILED, EMAIL_SEND_FILE[EMAIL_SEND.POST_FAILED]);

				throw error;
			} else {
				throw error;
			}
			throw error;
		}
	}
}
