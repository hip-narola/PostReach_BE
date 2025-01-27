import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import axios from 'axios';
import { Post } from 'src/entities/post.entity';
import { SocialMediaAccountService } from '../social-media-account/social-media-account.service';
import { SocialTokenDataDTO } from 'src/dtos/params/social-token-data-dto';
import { PostRepository } from 'src/repositories/post-repository';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import * as FormData from 'form-data';
import * as OAuth from 'oauth-1.0a';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';
import { TWITTER_CONST } from 'src/shared/constants/twitter-constant';
import { Throttle } from '@nestjs/throttler';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { TwitterUserDataDto } from 'src/dtos/response/twitter-user-data-dto';
import { PostInsightsDTO } from 'src/dtos/response/post-insights-dto';
import { AwsSecretsService } from '../aws-secrets/aws-secrets.service';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';
import { REDIS_STORAGE } from 'src/shared/constants/redis_storage_contstants';
import { CacheService } from 'src/modules/cache/cache-service';

@Injectable()
export class TwitterService {
	httpService: any;
	private consumerKey: string;
	private consumerSecret: string;
	private accessToken: string;
	private accessTokenSecret: string;
	private oauth: OAuth;
	private clientId: string;
	private twitterCallBack: string;

	constructor(
		private readonly socialMediaAccountService: SocialMediaAccountService,
		private readonly unitOfWork: UnitOfWork,
		private readonly secretService: AwsSecretsService,
		private cacheSerive: CacheService,
	) {

		this.initialize();
	}
	private async initialize() {
		const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
		this.clientId = secretData.CLIENT_ID;
		this.consumerKey = secretData.TWITTER_API_KEY;
		this.consumerSecret = secretData.TWITTER_API_KEY_SECRET;
		this.accessToken = secretData.TWITTER_ACCESS_TOKEN;
		this.accessTokenSecret = secretData.TWITTER_ACCESS_TOKEN_SECRET;
		this.twitterCallBack = secretData.TWITTER_CALLBACK_URL;
	}


	// Generate the authorization URL for OAuth 2.0 with PKCE
	async getAuthorizationUrl(userId: number): Promise<{ url: string; codeVerifier: string }> {
		const codeVerifier = this.generateCodeVerifier();
		const codeChallenge = await this.generateCodeChallenge(codeVerifier);
		const state = userId.toString();

		await this.cacheSerive.setCache(REDIS_STORAGE.TWITTER_CODEVERIFIER.replace('{0}', state), JSON.stringify({ codeVerifier, state }));

		const clientId = this.clientId;
		const redirectUri = this.twitterCallBack;

		const url = `https://twitter.com/i/oauth2/authorize?` +
			`response_type=code&` +
			`client_id=${clientId}&` +
			`redirect_uri=${redirectUri}&` +
			`scope=tweet.read tweet.write tweet.moderate.write users.read follows.read follows.write offline.access space.read mute.read mute.write like.read like.write list.read list.write block.read block.write bookmark.read bookmark.write&` +
			`state=${state}&` +
			`code_challenge=${codeChallenge}&` +
			`code_challenge_method=S256`;

		return { url, codeVerifier };
	}

	async exchangeCodeForToken(code: string, state: string): Promise<any> {

		// Exchange authorization code for access token
		const codeverifier_json = await this.cacheSerive.getCache(REDIS_STORAGE.TWITTER_CODEVERIFIER.replace('{0}', state));
		const codeverifier_value = JSON.parse(codeverifier_json);

		// Ensure the session data and state are valid
		if (!codeverifier_value || codeverifier_value.state !== state) {
			this.cacheSerive.deleteCache(REDIS_STORAGE.TWITTER_CODEVERIFIER.replace('{0}', state));
			throw new BadRequestException('Invalid or expired state parameter.');
		}

		const redirectUri = this.twitterCallBack;
		const tokenUrl = `${TWITTER_CONST.ENDPOINT}/oauth2/token`;
		const clientId = this.clientId;

		const params = new URLSearchParams();
		params.append('code', code);
		params.append('grant_type', 'authorization_code');
		params.append('client_id', clientId);
		params.append('redirect_uri', redirectUri);
		params.append('code_verifier', codeverifier_value.codeVerifier);

		try {
			const response = await axios.post(tokenUrl, params, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			if (response.status == 200) {
				const tokenDataDTO = new SocialTokenDataDTO(response.data); // Use DTO

				// Fetch Twitter user details
				const twitterUser = await this.fetchTwitterUser(response.data.access_token);

				tokenDataDTO.name = twitterUser.name;
				tokenDataDTO.user_name = twitterUser.username;
				tokenDataDTO.social_media_user_id = twitterUser.id; // Store the Twitter user ID
				tokenDataDTO.user_profile = twitterUser.profileImageUrl;

				// Store token and user details
				await this.socialMediaAccountService.storeTokenDetails(parseInt(state), tokenDataDTO, 'twitter');
				this.cacheSerive.deleteCache(REDIS_STORAGE.TWITTER_CODEVERIFIER.replace('{0}', state));
				return response;
			}
		} catch (error) {

			this.cacheSerive.deleteCache(REDIS_STORAGE.TWITTER_CODEVERIFIER.replace('{0}', state));
			throw new Error(`Failed to exchange code for token: ${JSON.stringify(error.response?.data || error.message)}`);
		}
	}


	@Throttle({ default: { limit: 25, ttl: 86400000 } })
	async fetchTwitterUser(bearerToken: string): Promise<TwitterUserDataDto> {
		try {
			const url = `${TWITTER_CONST.ENDPOINT}/users/me?user.fields=profile_image_url,created_at,description,verified,public_metrics&expansions=pinned_tweet_id`;

			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${bearerToken}`,
				},
			});

			if (response.status === 200 && response.data?.data) {
				const userData = response.data.data;

				const resultItem: TwitterUserDataDto = {
					id: userData.id,
					name: userData.name,
					username: userData.username,
					profileImageUrl: userData?.profile_image_url || null,
					publicMetrics: userData.public_metrics,
				};
				return resultItem;

				// return {
				// 	id: userData.id,
				// 	name: userData.name,
				// 	username: userData.username,
				// 	profileImageUrl: userData?.profile_image_url || null, // Profile image URL
				// 	publicMetrics: userData.public_metrics, // Include public metrics
				// };

			} else {
				throw new Error('Failed to fetch Twitter user details.');
			}
		} catch (error) {
			throw new Error(`Error fetching Twitter user: ${error.response?.data || error.message}`);
		}
	}

	private generateCodeVerifier(length = 128): string {
		return crypto.randomBytes(length).toString('base64url');
	}

	private async generateCodeChallenge(verifier: string): Promise<string> {
		return crypto.createHash('sha256').update(verifier).digest('base64url');
	}

	async disconnectTwitterProfile(userId: number): Promise<string> {
		try {
			// 1. Retrieve the user's Twitter token from the database
			const userSocialAccount = await this.socialMediaAccountService.findSocialAccountForConnectAndDisconnectProfile(userId, SocialMediaPlatformNames[SocialMediaPlatform.TWITTER], false);

			if (!userSocialAccount) {
				throw new HttpException('No Twitter profile linked to this user.', HttpStatus.NOT_FOUND);
			}

			await this.disconnectFromTwitter(userSocialAccount.social_media_user_id, userSocialAccount.encrypted_access_token);
			await this.unitOfWork.startTransaction();
			const socialMediaAccountRepo = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, true);
			userSocialAccount.isDisconnect = true;
			await socialMediaAccountRepo.update(userSocialAccount.id, userSocialAccount);
			await this.unitOfWork.completeTransaction();
			return 'Twitter profile disconnected successfully.';
		}
		catch (error) {

			await this.unitOfWork.rollbackTransaction();
			throw error;
		}
	}

	async disconnectFromTwitter(userId: string, accessToken: string): Promise<void> {
		const revokeUrl = `${TWITTER_CONST.ENDPOINT}/oauth2/revoke`;
		const clientId = this.clientId;

		const params = new URLSearchParams();
		params.append('token', accessToken);
		params.append('token_type_hint', 'access_token');
		params.append('client_id', clientId);

		try {
			const response = await axios.post(revokeUrl, params, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			if (response.status === 200) {
			} else {
			}
		} catch (error) {
			throw new Error(`Failed to revoke Twitter token: ${JSON.stringify(error.response?.data || error.message)}`);
		}
	}

	// Upload media using v1.1 API

	// async postTweet2(content: string, mediaId: string): Promise<any> {
	// 	try {
	// 		const url = `${TWITTER_CONST.ENDPOINT}/tweets`;
	// 		const accessToken = 'M1JlZnJpNXcwQVh4Q2dqZ2pjZkxEbTBhWDZQcUNiLTItOHZaWXJXRTdZU1p5OjE3MzUwMzk1MDA4NDU6MTowOmF0OjE';
	// 		const headers = {
	// 			'Authorization': `Bearer ${accessToken}`, // Use Bearer token for v2
	// 			'Content-Type': 'application/json',
	// 		};

	// 		const requestBody = {
	// 			text: content,
	// 			media: { media_ids: [mediaId] }, // Include the media ID in the request
	// 		};

	// 		const response = await axios.post(url, requestBody, { headers });
	// 		return response.data;
	// 	} catch (error) {
	// 		throw new Error(`Failed to post tweet: ${error.response?.data || error.message}`);
	// 	}
	// }

	// async getPostInsights(tweetId: string): Promise<any> {
	// 	const url = `${TWITTER_CONST.ENDPOINT}/tweets/${tweetId}`;
	// 	const requestData = {
	// 		url,
	// 		method: 'POST',
	// 		params: { ids: tweetId }, // Ensure the correct parameter
	// 	};

	// 	this.oauth = new OAuth({
	// 		consumer: { key: this.consumerKey, secret: this.consumerSecret },
	// 		signature_method: 'HMAC-SHA1',
	// 		hash_function(base_string, key) {
	// 			return crypto.createHmac('sha1', key).update(base_string).digest('base64');
	// 		},
	// 	});

	// 	const headers = this.oauth.toHeader(
	// 		this.oauth.authorize(
	// 			{ url: requestData.url, method: requestData.method },
	// 			{ key: this.accessToken, secret: this.accessTokenSecret }
	// 		)
	// 	);

	// 	try {
	// 		const response = await axios.get(url, {
	// 			params: requestData.params,
	// 			headers: { ...headers },
	// 		});
	// 		return response.data;

	// 	} catch (error) {
	// 		throw new Error(`Failed to fetch post insights: ${error.response?.data || error.message}`);
	// 	}
	// }


	async uploadMedia2(imageUrl: string): Promise<string> {
		try {
			this.oauth = new OAuth({
				consumer: {
					key: this.consumerKey,
					secret: this.consumerSecret,
				},
				signature_method: 'HMAC-SHA1',
				hash_function(base_string, key) {
					return crypto.createHmac('sha1', key).update(base_string).digest('base64');
				},
			});

			const imageBuffer = (await axios.get(imageUrl, { responseType: 'arraybuffer' })).data;
			const mediaData = Buffer.from(imageBuffer).toString('base64');

			const url = `${TWITTER_CONST.ENDPOINTV1}/media/upload.json`;

			const formData = new FormData();
			formData.append('media_data', mediaData);

			const headers = this.oauth.toHeader(
				this.oauth.authorize(
					{ url, method: 'POST' },
					{ key: this.accessToken, secret: this.accessTokenSecret }
				)
			);

			const response = await axios.post(url, formData, {
				headers: {
					...headers,
					...formData.getHeaders(),
				},
			});

			if (response.status === 200) {
				return response.data.media_id_string;
			} else {
				throw new Error(`Media upload failed: ${response.statusText}`);
			}
		} catch (error) {

			throw new Error(`Failed to upload media: ${error.response?.data || error.message}`);
		}
	}

	@Throttle({ default: { limit: 17, ttl: 86400000 } })
	async postToTwitter(
		postId: number,
		pageId: string | null,
		accessToken: string,
		socialMediaUserId: string,
		message: string,
		imageUrl?: string,
		hashtags?: string[]
	): Promise<any> {
		try {

			let postDataMessage = `${message}${hashtags?.length ? `\n\n${hashtags.map((tag) => `${tag}`).join(' ')}` : ''}`.trim();
			let mediaId: string | null = null; // Declare mediaId and initialize it as null

			// Upload image logic (if needed)
			if (imageUrl) {
				mediaId = await this.uploadMedia2(imageUrl);
				// var mediaId = '1871537014492835840';

			}

			const url = `${TWITTER_CONST.ENDPOINT}/tweets`;
			const headers = {
				Authorization: `Bearer ${accessToken}`, // Use Bearer token for v2
				'Content-Type': 'application/json',
			};

			if (postDataMessage.length > 280) {
				postDataMessage = postDataMessage.substring(postDataMessage.length - 270); // Keep last 270 characters
			}

			const r = (Math.random() + 1).toString(36).substring(7);
			const requestBody: any = {
				text: `${postDataMessage}${r}`,
			};

			// if (mediaId) {
			// 	requestBody.media = {
			// 		media_ids:
			// 			[mediaId]
			// 	};
			// }
			if (mediaId) {
				requestBody.media = { media_ids: [mediaId] };
			}

			const response = await axios.post(url, requestBody, { headers });

			// Start a transaction to update the database
			await this.unitOfWork.startTransaction();

			const socialMediaInsightsRepo = this.unitOfWork.getRepository(PostRepository, Post, true);
			const record = await socialMediaInsightsRepo.findOne(postId);

			if (!record) {
				throw new Error(`Post with ID ${postId} not found.`);
			}

			record.external_platform_id = response.data.data.id || response.data.id;;
			await socialMediaInsightsRepo.update(postId, record);
			await this.unitOfWork.completeTransaction();

			return response.data;
		} catch (error: any) {

			// Ensure rollback only happens if a transaction was started
			await this.unitOfWork.rollbackTransaction();
			const errorMessage = error.response?.data || error.message || 'An unexpected error occurred.';
			throw new Error(`Failed to post tweet: ${errorMessage}`);
		}
	}

	async fetchAndUpdateTwitterPostData(posts: Post[]) {
		await this.unitOfWork.startTransaction();
		const postRepository = this.unitOfWork.getRepository(PostRepository, Post, true);
		try {
			for (const post of posts) {
				const socialMediaAccount = post.postTask?.socialMediaAccount;
				if (!socialMediaAccount?.encrypted_access_token || !post.external_platform_id) {
					continue;
				}
				try {
					// Fetch data from the Twitter API
					const postDetails = await this.fetchTweetMetrics(
						post.external_platform_id,
						socialMediaAccount.encrypted_access_token,
					);
					const record = await postRepository.findOne(post.id);
					record.no_of_comments = postDetails.no_of_comments;
					record.no_of_likes = postDetails.likes;
					record.no_of_views = postDetails.views;
					await postRepository.update(post.id, record);
				} catch (error) {
					await this.unitOfWork.rollbackTransaction();

				}
			}

			await this.unitOfWork.completeTransaction();
		}
		catch (error) {
			await this.unitOfWork.rollbackTransaction();
		}
	}

	async fetchTweetMetrics(tweetId: string, accessToken: string): Promise<PostInsightsDTO> {
		try {
			const response = await axios.get(`${TWITTER_CONST.ENDPOINT}/tweets/${tweetId}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				params: {
					'tweet.fields': 'public_metrics,created_at',
				},
			});
			const metrics = response.data.data.public_metrics;

			return {
				likes: metrics.like_count,
				no_of_comments: metrics.quote_count,
				views: metrics.impression_count || 0
			};

		} catch (error) {
			throw new Error(`Failed to fetch tweet metrics: ${error.response?.data || error.message}`);
		}
	}

	async refreshToken(twitterAccount: SocialMediaAccount): Promise<void> {
		const tokenUrl = `${TWITTER_CONST.ENDPOINT}/oauth2/token`;
		const clientId = this.clientId;

		const params = new URLSearchParams();
		params.append('grant_type', 'refresh_token');
		params.append('refresh_token', twitterAccount.refresh_token);
		params.append('client_id', clientId); 

		try {
			// Start the transaction
			await this.unitOfWork.startTransaction();

			const response = await axios.post(tokenUrl, params, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			const socialMediaAccountRepository = this.unitOfWork.getRepository(
				SocialMediaAccountRepository,
				SocialMediaAccount,
				true
			);
			if (response.status === 200 && response.data) {
				const { access_token, token_type, expires_in, refresh_token, scope } = response.data;
				// Update the SocialMediaAccount entity with new token details
				twitterAccount.encrypted_access_token = access_token;
				twitterAccount.token_type = token_type;
				twitterAccount.expires_in = expires_in;
				twitterAccount.refresh_token = refresh_token;
				twitterAccount.scope = scope;

				// Persist changes to the repository
				await socialMediaAccountRepository.update(twitterAccount.id, twitterAccount);
			} else {
				throw new Error('Failed to refresh token: Unexpected response from server.');
			}

			// Complete the transaction after the update
			await this.unitOfWork.completeTransaction();
		} catch (error) {
			const errorDetails = error.response?.data || error.message;
			// Rollback the transaction in case of an error
			if (this.unitOfWork['queryRunner']) {  // Access queryRunner privately for rollback
				try {
					await this.unitOfWork.rollbackTransaction();
				} catch (rollbackError) {
				}
			} else {
			}
		}
	}
}
