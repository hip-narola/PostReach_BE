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
import { PostJobLogService } from 'src/services/post-job-log/post-job-log.service';
import { PostJobLog } from 'src/entities/post-job-log.entity';
import axios from 'axios';
import { POST_JOB_LOG_STATUS } from 'src/shared/constants/post-job-log-constants';

@Processor('post-queue')
export class SchedulePostProcessor extends WorkerHost {
	constructor(private readonly approvalQueueService: ApprovalQueueService,
		private readonly facebookService: FacebookService,
		private readonly linkedinService: LinkedinService,
		private readonly instagramService: InstagramService,
		private readonly twitterService: TwitterService,
		private readonly emailService: EmailService,
		private readonly userService: UserService,
		private readonly logger: Logger,
		private readonly postJobLogService: PostJobLogService
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
			let message;
			if (axios.isAxiosError(error)) {
				message = error.response?.data.error.message;
				this.logger.error(
					`Error processing scheduled post for PostId: ${PostId}` +
					message,
					'SchedulePostProcessor'
				);
			}
			else {
				message = error.message;
				this.logger.error(
					`Error processing scheduled post for PostId: ${PostId}` +
					message,
					'SchedulePostProcessor'
				);
			}

			let status;
			if (job.attemptsMade <= 3) {
				status = POST_JOB_LOG_STATUS.RETRY;
			}
			else {
				status = POST_JOB_LOG_STATUS.FAIL;
			}


			const details = await this.postJobLogService.findPostJobLogByPostTaskId(Id);

			if (!details) {
				const postJobLog = new PostJobLog();
				postJobLog.error_message = message;
				postJobLog.created_at = new Date();
				postJobLog.created_By = userId;
				postJobLog.modified_date = null;
				postJobLog.retry_count = job.attemptsMade + 1;
				postJobLog.postTask = Id;
				postJobLog.status = status;
				postJobLog.job_id = job.id;
				await this.postJobLogService.createPostJobLog(postJobLog);
			}
			else {
				details.error_message = message;
				details.modified_By = userId;
				details.modified_date = new Date();
				details.retry_count = job.attemptsMade + 1;
				details.job_id = job.id;
				details.status = status;
				await this.postJobLogService.updatePostJobLog(details);
			}

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
