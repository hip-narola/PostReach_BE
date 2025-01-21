import { Processor, WorkerHost,  } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ApprovalQueueService } from '../../services/approval-queue/approval-queue.service';
import { FacebookService } from '../../services/facebook/facebook.service';
import { LinkedinService } from '../../services/linkedin/linkedin.service';
import { InstagramService } from '../../services/instagram/instagram.service';
import { TwitterService } from '../../services/twitter/twitter.service';
import { SocialMediaPlatformNames, SocialMediaPlatform } from 'src/shared/constants/social-media.constants';
import { NotificationService } from '../../services/notification/notification.service';
import { NotificationMessage, NotificationType } from 'src/shared/constants/notification-constants';
import { EmailService } from '../../services/email/email.service';
import { UserService } from '../../services/user/user.service';
import { EMAIL_SEND, EMAIL_SEND_FILE } from 'src/shared/constants/email-notification-constants';
import { POST_TASK_STATUS } from 'src/shared/constants/post-task-status-constants';

@Processor('post-queue')
export class SchedulePostProcessor extends WorkerHost {
	
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
		console.log(" SchedulePostProcessor started job : ", job);
		const { Id, channel, PostId, accessToken, message, hashtags, imageUrl, pageId, SocialMediauserId, instagramId, userId } = job.data;
		try {
			console.log(" SchedulePostProcessor Id : ", Id, " channel :", channel, " PostId : ", PostId);
			// throw new Error('Failed to publish post');
			switch (channel) {
				case `${SocialMediaPlatformNames[SocialMediaPlatform['FACEBOOK']]}`:
					await this.facebookService.postToFacebook(PostId, pageId, accessToken, message, hashtags, imageUrl);
					await this.approvalQueueService.updateStatusAfterPostExecution(Id, POST_TASK_STATUS.EXECUTE_SUCCESS);
					await this.notificationService.saveData(userId, NotificationType.POST_PUBLISHED, NotificationMessage[NotificationType.POST_PUBLISHED]);
					break;

				case `${SocialMediaPlatformNames[SocialMediaPlatform['LINKEDIN']]}`:
					await this.linkedinService.postToLinkedIn(PostId, pageId, accessToken, SocialMediauserId, message, imageUrl, hashtags);
					await this.approvalQueueService.updateStatusAfterPostExecution(Id, POST_TASK_STATUS.EXECUTE_SUCCESS);
					await this.notificationService.saveData(userId, NotificationType.POST_PUBLISHED, NotificationMessage[NotificationType.POST_PUBLISHED]);
					break;

				case `${SocialMediaPlatformNames[SocialMediaPlatform['INSTAGRAM']]}`:

					await this.instagramService.postToInstagram(PostId, instagramId, accessToken, imageUrl, message, hashtags);
					await this.approvalQueueService.updateStatusAfterPostExecution(
						Id, POST_TASK_STATUS.EXECUTE_SUCCESS);
					await this.notificationService.saveData(userId, NotificationType.POST_PUBLISHED, NotificationMessage[NotificationType.POST_PUBLISHED]);
					break;

				case `${SocialMediaPlatformNames[SocialMediaPlatform['TWITTER']]}`:
					await this.twitterService.postToTwitter(PostId, pageId, accessToken, SocialMediauserId, message, imageUrl, hashtags);
					await this.approvalQueueService.updateStatusAfterPostExecution(Id, POST_TASK_STATUS.EXECUTE_SUCCESS);
					await this.notificationService.saveData(userId, NotificationType.POST_PUBLISHED, NotificationMessage[NotificationType.POST_PUBLISHED]);
					break;
			}
		}
		catch (error) {
			console.log("SchedulePostProcessor exception: ", error);
			if (job.attemptsMade >= 4) {
				await this.approvalQueueService.updateStatusAfterPostExecution(Id, POST_TASK_STATUS.FAIL);
				await this.notificationService.saveData(userId, NotificationType.POST_FAILED, NotificationMessage[NotificationType.POST_FAILED]);
				const user = await this.userService.findOne(userId);

				await this.emailService.sendEmail(user.email, EMAIL_SEND.POST_FAILED, EMAIL_SEND_FILE[EMAIL_SEND.POST_FAILED]);

				throw error;
			}
			throw error;
		}
	}
}
