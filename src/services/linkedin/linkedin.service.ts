import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { SocialTokenDataDTO } from 'src/dtos/params/social-token-data-dto';
import { SocialMediaAccountService } from '../social-media-account/social-media-account.service';
import { UnitOfWork } from 'src/unitofwork/unitofwork';
import { PostRepository } from 'src/repositories/post-repository';
import { Post } from 'src/entities/post.entity';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';
import { SocialMediaAccount } from 'src/entities/social-media-account.entity';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';
import { LINKEDIN_CONST } from 'src/shared/constants/linkedin-constant';
import { LinkedInPostInsightsDto } from 'src/dtos/response/linkedin-post-insights-dto';
import { LinkedInUserDataDto } from 'src/dtos/response/linkedin-user-data-dto';
import { LinkedInOrganizationDetailsDto } from 'src/dtos/response/linkedin-organization-detail-dto';
import { LinkedInUserPagesDto } from 'src/dtos/response/linkedin-user-pages-dto';
import { Throttle } from '@nestjs/throttler';
import { NotificationService } from '../notification/notification.service';
import { AwsSecretsService } from '../aws-secrets/aws-secrets.service';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';
import { ConfigService } from '@nestjs/config';
import { LinkedInTokenParamDto } from 'src/dtos/params/linkedin-token-data.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class LinkedinService {
	private linkedinClientID: string;
	private linkedinClientSecret: string;
	private linkedinScope: string;
	private linkedinCallBack: string;

	constructor(
		private readonly socialMediaAccountService: SocialMediaAccountService,
		private readonly unitOfWork: UnitOfWork,
		private readonly notificationService: NotificationService,
		private readonly secretService: AwsSecretsService,
		private configService: ConfigService
	) {
		this.initialize();
	}

	private async initialize() {
		const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
		this.linkedinClientID = secretData.LINKEDIN_CLIENT_ID;
		this.linkedinClientSecret = secretData.LINKEDIN_CLIENT_SECRET;
		this.linkedinScope = secretData.LINKEDIN_SCOPE;
		this.linkedinCallBack = secretData.LINKEDIN_CALLBACK_URL;
	}

	async getLinkedInAuthUrl(): Promise<string> {
		const clientId = this.linkedinClientID;
		const scope = this.linkedinScope;
		const redirectUri = this.linkedinCallBack;

		return `${LINKEDIN_CONST.AUTH_ENDPOINT}/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
	}

	async getAccessToken(code: string): Promise<any> {
		// console.log(userId, 'userId');
		const clientId = this.linkedinClientID;
		const clientSecret = this.linkedinClientSecret;
		const redirectUri = this.linkedinCallBack;

		try {
			const response = await axios.post(
				`${LINKEDIN_CONST.AUTH_ENDPOINT}/accessToken`,
				new URLSearchParams({
					grant_type: 'authorization_code',
					code,
					redirect_uri: redirectUri,
					client_id: clientId,
					client_secret: clientSecret,
				}).toString(),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			);

			if (response.status !== 200) {
				throw new Error('Failed to retrieve access token from LinkedIn');
			}

			// const userResponse = await this.fetchLinkedInUserData(response.data.access_token);

			// const tokenDataDTO = new SocialTokenDataDTO(response.data);
			// tokenDataDTO.user_profile = ' userResponse.profilePicture || null';
			// tokenDataDTO.user_name = '`${userResponse.firstName} ${userResponse.lastName}`';
			// tokenDataDTO.social_media_user_id = 'userResponse.id'; // Store the Twitter user ID
			// tokenDataDTO.page_id = null;
			// tokenDataDTO.token_type = LINKEDIN_CONST.LINKEDINID;

			// await this.socialMediaAccountService.storeTokenDetails(userId, tokenDataDTO, SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN]);
			return response;
		} catch (error) {
			throw new Error(`Failed to exchange code for token: ${error.response?.data || error.message}`);
		}
	}

	// async getOrganizationId(accessToken: string): Promise<string> {
	// 	const apiUrl = `${LINKEDIN_CONST.ENDPOINT}/organizationAcls?q=roleAssignee`;

	// 	try {
	// 		const response = await axios.get(apiUrl, {
	// 			headers: {
	// 				'Authorization': `Bearer ${accessToken}`,
	// 				'X-Restli-Protocol-Version': '2.0.0',
	// 			},
	// 		});
	// 		// Assuming you are the owner of the organization, this will give you the organization info
	// 		const organizationId = response.data.elements[0].id; // This should be the organization ID
	// 		return organizationId;
	// 	} catch (error) {
	// 		throw new Error(`Failed to retrieve organization ID: ${error.response?.data || error.message}`);
	// 	}
	// }

	@Throttle({ default: { limit: 100, ttl: 86400000 } })
	// async getUserPages(userId: number, platform: number): Promise<LinkedInUserPagesDto[]> {
	async getUserPages(token: string): Promise<LinkedInUserPagesDto[]> {

		// const userSocialAccount = await this.socialMediaAccountService.findSocialAccountOfUserForLinkedIn(userId, SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN]);

		const url = `${LINKEDIN_CONST.ENDPOINT}/organizationAcls?q=roleAssignee`;
		try {
			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const organizations = response.data.elements || [];

			if (organizations.length === 0) {
				return [];
			}

			// Fetch details for each organization
			const organizationDetails = await Promise.all(
				organizations.map((org) => {
					const organizationId = this.extractOrganizationId(org.organization);
					if (organizationId) {
						return this.getOrganizationDetails(organizationId, token);
					}
					return null;
				})
			);

			const validOrganizationDetails = organizationDetails.filter(Boolean);

			// Format the response
			const formattedResponse = validOrganizationDetails.map((org) => ({
				pageId: org.id,
				pageName: org.localizedName,
				logoUrl: org.logoUrl ? org.logoUrl : null,
				isPage: true
			}));

			const userResponse = await this.fetchLinkedInUserData(token);

			// const tokenDataDTO = new SocialTokenDataDTO(response.data);
			// tokenDataDTO.user_profile = ' userResponse.profilePicture || null';
			// tokenDataDTO.user_name = '`${userResponse.firstName} ${userResponse.lastName}`';
			// tokenDataDTO.social_media_user_id = 'userResponse.id'; // Store the Twitter user ID
			// tokenDataDTO.page_id = null;
			// tokenDataDTO.token_type = LINKEDIN_CONST.LINKEDINID;

			const LinkedinUser = {
				pageId: userResponse.id,
				pageName: `${userResponse.firstName} ${userResponse.lastName}`,
				logoUrl: userResponse.profilePicture || null,
				isPage: false
			}

			formattedResponse.unshift(LinkedinUser);

			return formattedResponse;

		} catch (error) {
			throw new Error(`Failed to fetch user pages., ${error.response?.data || error.message}`);
		}
	}

	private extractOrganizationId(urn: string): string {
		const match = urn.match(/urn:li:organization:(\d+)/);
		return match ? match[1] : '';
	}

	async getPostInsights(accessToken: string, postId: string): Promise<LinkedInPostInsightsDto> {
		const url = `${LINKEDIN_CONST.ENDPOINT}/socialActions/${postId}`;
		const headers = { Authorization: `Bearer ${accessToken}` };

		try {
			const response = await axios.get(url, { headers });

			return {
				comments: response.data?.commentsSummary?.aggregatedTotalComments || 0,
				likesSummary: response.data?.likesSummary?.aggregatedTotalLikes || 0,
			}
		} catch (error) {
			throw new Error(`Failed to fetch post insights., ${error.response?.data || error.message}`);
		}
	}

	// Fetch details of a specific organization
	private async getOrganizationDetails(organizationId: string, accessToken: string): Promise<LinkedInOrganizationDetailsDto> {

		const url = `${LINKEDIN_CONST.ENDPOINT}/organizations/${organizationId}?projection=(id,name,localizedName,logoV2(original~:playableStreams))`;
		try {
			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			const { id, localizedName, logoV2 } = response.data;

			const logoUrl = logoV2?.['original~']?.elements?.[0]?.identifiers?.[0]?.identifier || null;

			return {
				id,
				localizedName,
				logoUrl: logoUrl !== undefined ? logoUrl : null, // Only include logo if it exists
			};
		} catch (error) {
			throw new Error(`Failed to fetch details for organization ID ${organizationId}${error}`);
		}
	}

	@Throttle({ default: { limit: 100, ttl: 86400000 } })
	async fetchLinkedInUserData(accessToken: string): Promise<LinkedInUserDataDto> {
		try {
			const response = await axios.get(`${LINKEDIN_CONST.ENDPOINT}/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			const userData = response.data;

			if (response.status !== 200) {
				throw new Error('Failed to retrieve LinkedIn user data');
			}
			const profileImageUrl = response.data.profilePicture['displayImage~'].elements[0].identifiers[0].identifier;

			return {
				id: userData.id,
				firstName: userData.firstName.localized.en_US,
				lastName: userData.lastName.localized.en_US,
				profilePicture: profileImageUrl || null,
			};
		} catch (error) {
			throw new Error(`Failed to fetch LinkedIn user info: ${error}`);
		}
	}

	@Throttle({ default: { limit: 100, ttl: 86400000 } })
	async postToLinkedIn(
		postId: number,
		pageId: string | null,
		accessToken: string,
		socialMediaUserId: string,
		message: string,
		imageUrl?: string,
		hashtags?: string[]
	): Promise<Post> {
		try {
			// Construct the message with hashtags if provided
			const postDataMessage = `${message}${hashtags?.length ? `\n\n${hashtags.map((tag) => `${tag}`).join(' ')}` : ''}`.trim();

			let assetUrn: string | null = null;

			if (imageUrl) {

				// 1. Register the image upload on LinkedIn
				const registerResponse = await axios.post(
					`${LINKEDIN_CONST.ENDPOINT}/assets?action=registerUpload`,
					{
						registerUploadRequest: {
							owner: pageId ? `urn:li:organization:${pageId}` : `urn:li:person:${socialMediaUserId}`,
							recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
							serviceRelationships: [
								{
									identifier: 'urn:li:userGeneratedContent',
									relationshipType: 'OWNER',
								},
							],
						},
					},
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
							'Content-Type': 'application/json',
						},
					}
				);

				const uploadUrl = registerResponse.data?.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl;
				assetUrn = registerResponse.data?.value?.asset;

				if (!uploadUrl || !assetUrn) {
					throw new Error('Failed to register image upload. Missing upload URL or asset URN.');
				}

				// 2. Fetch the image and upload it to LinkedIn
				const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
				const mimeType = imageResponse.headers['content-type'] || 'application/octet-stream';
				await axios.put(uploadUrl, imageResponse.data, {
					headers: {
						'Content-Type': mimeType,
					},
				});

			}

			// 3. Construct the post payload
			const requestPayload = {
				author: pageId ? `urn:li:organization:${pageId}` : `urn:li:person:${socialMediaUserId}`,
				lifecycleState: 'PUBLISHED',
				specificContent: {
					'com.linkedin.ugc.ShareContent': {
						shareCommentary: {
							text: postDataMessage,
						},
						shareMediaCategory: assetUrn ? 'IMAGE' : 'NONE',
						...(assetUrn && {
							media: [
								{
									status: 'READY',
									description: { text: 'Image description here' }, // Optional
									media: assetUrn,
									title: { text: 'Image title here' }, // Optional
								},
							],
						}),
					},
				},
				visibility: {
					'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
				},
			};

			// 4. Make the POST request
			const response = await axios.post(
				`${LINKEDIN_CONST.ENDPOINT}/ugcPosts`,
				requestPayload,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
				}
			);

			// Transaction logic to update the post record in the database
			await this.unitOfWork.startTransaction();
			const socialMediaInsightsRepo = this.unitOfWork.getRepository(PostRepository, Post, true);
			const record = await socialMediaInsightsRepo.findOne(postId);

			if (record) {
				record.external_platform_id = response.data.id;
				await socialMediaInsightsRepo.update(postId, record);
			} else {
				throw new Error(`Post with ID ${postId} not found.`);
			}

			await this.unitOfWork.completeTransaction();

			return response.data;
		} catch (error: any) {
			// Rollback transaction on failure
			await this.unitOfWork.rollbackTransaction();
			// Throw detailed error for debugging
			throw new Error(`Failed to post to LinkedIn: ${error.response?.data?.message || error.message}`);
		}
	}

	async connectedLinkedinAccount(userId: number, pageId: string, Ispage: boolean, logoUrl: string, linkedInTokenDetails: LinkedInTokenParamDto) {
		try {
			await this.unitOfWork.startTransaction();

			const socialMediaAccountRepo = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, true);

			const userSocialAccount = await this.socialMediaAccountService.findSocialAccountOfUserForLinkedIn(userId, SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN]);
			const userResponse = await this.fetchLinkedInUserData(linkedInTokenDetails.encrypted_access_token);
			//crate or update soc. acc.
			if (!userSocialAccount) {
				//create
				const tokenDataDTO = new SocialTokenDataDTO(linkedInTokenDetails);

				tokenDataDTO.user_profile = userResponse.profilePicture || null;
				tokenDataDTO.scope = this.linkedinScope;
				tokenDataDTO.user_name = `${userResponse.firstName} ${userResponse.lastName}`;
				tokenDataDTO.social_media_user_id = userResponse.id; // Store the Twitter user ID
				tokenDataDTO.page_id = null;
				tokenDataDTO.token_type = LINKEDIN_CONST.LINKEDINID;
				tokenDataDTO.platform = SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN];
				tokenDataDTO.user_id = userId;
				const data = plainToInstance(SocialMediaAccount, tokenDataDTO);
				await socialMediaAccountRepo.create(data);
				// await this.socialMediaAccountService.storeTokenDetails(userId, tokenDataDTO, SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN]);
				// await socialMediaAccountRepo.create(tokenDataDTO);

				// await this.socialMediaAccountService.storeTokenDetails(userId, tokenDataDTO, SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN]);
				// throw new Error('No LinkedIn account found for the given user');
			} else {

				userSocialAccount.user_profile = userResponse.profilePicture || null;
				userSocialAccount.user_name = `${userResponse.firstName} ${userResponse.lastName}`;
				userSocialAccount.social_media_user_id = userResponse.id; // Store the Twitter user ID
				userSocialAccount.token_type = Ispage ? LINKEDIN_CONST.PAGE_ACCESS_TOKEN : LINKEDIN_CONST.LINKEDINID
				userSocialAccount.user_profile = logoUrl;
				userSocialAccount.page_id = Ispage ? pageId : null;
				userSocialAccount.connected_at =  new Date();
				userSocialAccount.created_at = new Date();
                userSocialAccount.updated_at = new Date();
				await socialMediaAccountRepo.update(userSocialAccount.id, userSocialAccount);
			}
			await this.unitOfWork.completeTransaction();
		} catch (error: any) {
			await this.unitOfWork.rollbackTransaction();
			throw new Error(`Failed to save connected page: ${error.message}`);
		}
	}

	async fetchAndUpdatePostData() {
		await this.unitOfWork.startTransaction();
		const postRepository = this.unitOfWork.getRepository(PostRepository, Post, true);
		try {
			const posts = await postRepository.fetchLinkedInPosts();
			for (const post of posts) {
				const socialMediaAccount = post.postTask?.socialMediaAccount;
				if (!socialMediaAccount?.encrypted_access_token || !post.external_platform_id) {
					continue;
				}
				try {
					// Fetch data from the Facebook API
					const postDetails = await this.getPostInsights(
						socialMediaAccount.encrypted_access_token,
						post.id.toString()
					);
					const record = await postRepository.findOne(post.id);
					record.no_of_comments = postDetails.comments;
					record.no_of_likes = postDetails.likesSummary;
					record.no_of_views = 0;
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
	async disconnectLinkedInProfile(userId: number): Promise<string> {
		try {
			// 1. Retrieve the user's Linkedin token from the database
			const userSocialAccount = await this.socialMediaAccountService.findSocialAccountForConnectAndDisconnectProfile(userId, SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN], false);
			if (!userSocialAccount) {
				throw new HttpException('No Linkedin profile linked to this user.', HttpStatus.NOT_FOUND);
			}
			await this.unitOfWork.startTransaction();
			const socialMediaAccountRepo = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, true);
			userSocialAccount.isDisconnect = true;
			await socialMediaAccountRepo.update(userSocialAccount.id, userSocialAccount);
			await this.unitOfWork.completeTransaction();
			return 'Linkedin profile disconnected successfully.';
		}
		catch (error) {
			await this.unitOfWork.rollbackTransaction();
		}
	}
}
