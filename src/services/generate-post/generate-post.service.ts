import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { GeneratePostPipelineRequestDTO, Mode, PostTemplateDTO, ReGeneratePostPipelineRequestDTO, SocialPostNumberDTO, UserInfoDTO, UserInfoType } from 'src/dtos/params/generate-post-param.dto';
import { generatePostResponseDTO } from 'src/dtos/response/generate-post-response.dto';
import { PostTaskRepository } from 'src/repositories/post-task-repository';
import { PostRepository } from 'src/repositories/post-repository';
import { Post } from 'src/entities/post.entity';
import { PostTask } from 'src/entities/post-task.entity';
import { POST_TASK_TYPE } from 'src/shared/constants/post-task-type-constants';
import { POST_TASK_STATUS } from 'src/shared/constants/post-task-status-constants';
import { AssetRepository } from 'src/repositories/asset-repository';
import { Asset } from 'src/entities/asset.entity';
import { ASSET_TYPE } from 'src/shared/constants/asset-type-constants';
import { UserRepository } from 'src/repositories/userRepository';
import { SocialMediaAccountRepository } from 'src/repositories/social-media-account-repository';
import { AwsSecretsService } from '../aws-secrets/aws-secrets.service';
import { AWS_SECRET } from 'src/shared/constants/aws-secret-name-constants';
import { COUNTRY } from 'src/shared/constants/country-constants';
import { LANGUAGE } from 'src/shared/constants/language-constants';
import { IS_DUMMY_STATUS } from 'src/shared/constants/is-dummy-status-constants';
import { SocialMediaPlatform, SocialMediaPlatformNames } from 'src/shared/constants/social-media.constants';
import { UserCreditRepository } from 'src/repositories/user-credit-repository';
import { UserCredit } from 'src/entities/user_credit.entity';
import axios from 'axios';
import { POST_RESPONSE } from 'src/shared/constants/post-response-constants';
import { PostRetry } from 'src/entities/post-retry.entity';
import { generateId, IdType } from 'src/shared/utils/generate-id.util';
import { PostRetryRepository } from 'src/repositories/post-retry-repository';
import { POST_RETRY_COUNT } from 'src/shared/constants/post-retry-count-constants';

@Injectable()
export class GeneratePostService {

    // TODO : DO NOT USE any ANYWHERE
    constructor(
        private readonly httpService: HttpService,
        // private readonly subscriptionService: SubscriptionService,
        private readonly secretService: AwsSecretsService,
        private readonly userRepository: UserRepository,
        private readonly postTaskRepository: PostTaskRepository,
        private readonly postRepository: PostRepository,
        private readonly assetRepository: AssetRepository,
        private readonly userCreditRepository: UserCreditRepository,
        private readonly socialMediaAccountRepository: SocialMediaAccountRepository,
        private readonly postRetryRepository: PostRetryRepository
    ) { }

    async generatePostByAIAPI(userCredit: UserCredit[]): Promise<void> {
        try {
            console.log('generatePostByAIAPI:::  userCredit', userCredit)
            const details = await this.userRepository.findUserAnswersWithQuestionsAndSocialMedia(userCredit[0].user.id);
            console.log('generatePostByAIAPI::: details', details)

            //generate post only for left days of subscription
            const daysDifference = (Math.floor(Math.abs(new Date(details.userSubscription.end_Date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) + 1;

            console.log('generatePostByAIAPI::: daysDifference', daysDifference);

            let PostRequestCount: number;
            const today = new Date();
            const subscriptionStart = new Date(details.userSubscription.start_Date);
            const subscriptionValidDate = new Date(subscriptionStart);
            subscriptionValidDate.setDate(subscriptionValidDate.getDate() + 14);
            console.log('generatePostByAIAPI::: today: ', today, 'subscriptionStart: ', subscriptionStart, 'subscriptionValidDate :', subscriptionValidDate);

            const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);

            const token = secretData.TOKEN;
            let apiUrl: string;
            const socialPostNumber: SocialPostNumberDTO = {
                facebook_posts_number: 0,
                instagram_posts_number: 0,
                linkedin_posts_number: 0,
                twitter_posts_number: 0
            }

            let generatePostRequest: ReGeneratePostPipelineRequestDTO | GeneratePostPipelineRequestDTO;

            for (let i = 0; i < userCredit.length; i++) {
                const element = userCredit[i];
                PostRequestCount = 0;

                element.social_media = await this.socialMediaAccountRepository.findOne(element.social_media_id);
                if (details.userSubscription.cycle == 0) {
                    PostRequestCount = element.current_credit_amount;
                }
                else if (details.userSubscription.cycle == 1) {

                    if (today >= subscriptionValidDate && element.current_credit_amount > daysDifference) {
                        PostRequestCount = daysDifference;
                    } else {
                        if (element.last_trigger_date != null) {
                            PostRequestCount = element.current_credit_amount;
                        }
                        else {
                            PostRequestCount = element.current_credit_amount / 2;
                        }
                    }
                }
                else if (details.userSubscription.cycle >= 2) {

                    if (today >= subscriptionValidDate && element.current_credit_amount > daysDifference) {
                        PostRequestCount = daysDifference;
                    }
                    else {
                        PostRequestCount = element.current_credit_amount;
                    }
                }
                else {
                    PostRequestCount = element.current_credit_amount;
                }

                if (element.social_media.platform == SocialMediaPlatformNames[SocialMediaPlatform.FACEBOOK])
                    socialPostNumber.facebook_posts_number = Math.round(PostRequestCount);
                else if (element.social_media.platform == SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN])
                    socialPostNumber.linkedin_posts_number = Math.round(PostRequestCount);
                else if (element.social_media.platform == SocialMediaPlatformNames[SocialMediaPlatform.TWITTER])
                    socialPostNumber.twitter_posts_number = Math.round(PostRequestCount);
                else if (element.social_media.platform == SocialMediaPlatformNames[SocialMediaPlatform.INSTAGRAM])
                    socialPostNumber.instagram_posts_number = Math.round(PostRequestCount);
            }

            console.log("generatePostByAIAPI::: socialPostNumber ", socialPostNumber);

            if (userCredit.length == 1 && PostRequestCount < 15 && details.userSubscription.cycle != 0) {
                const socialMediaIds = details.socialMedia.map((media) => media.id);

                console.log('generatePostByAIAPI::: socialMediaIds', socialMediaIds);

                const posts = await this.postTaskRepository.fetchPostTaskOfSocialMedia(socialMediaIds);
                console.log('generatePostByAIAPI:: posts', posts)
                const postsForPlatform = posts.slice(0, PostRequestCount).map(postTask => ({
                    post_id: postTask.id,
                    platform: userCredit[0].social_media.platform,  // Set the platform dynamically
                    image_generation: { regenerate_prompt: false, regenerate_image: false },
                    schedule_start_date: userCredit[0]?.start_Date ? userCredit[0].start_Date.toISOString().split('T')[0] : '',
                    schedule_end_date: userCredit[0]?.end_Date ? userCredit[0].end_Date.toISOString().split('T')[0] : ''
                }));

                console.log('generatePostByAIAPI::: postsForPlatform', postsForPlatform)
                apiUrl = secretData.REGENERATE_AI_API;

                generatePostRequest = {
                    post_templates: postsForPlatform,
                    is_dummy: IS_DUMMY_STATUS.TRUE,
                };

            }
            else {
                apiUrl = secretData.APIURL;

                // Bind data from these info
                const userInfo: UserInfoDTO[] = details?.userAnswers?.map((answer: any) => ({
                    name: answer.question?.questionName || '',
                    value: answer.answerText || '',
                    type: UserInfoType.TEXT,
                    isUrl: answer.question?.questionName == 'personal_website',
                })) || [];

                generatePostRequest = {
                    mode: Mode.AUTOPILOT,
                    social_post_number: socialPostNumber,
                    user_info: userInfo,
                    schedule_start_date: userCredit[0]?.start_Date ? userCredit[0].start_Date.toISOString().split('T')[0] : '',
                    schedule_end_date: userCredit[0]?.end_Date ? userCredit[0].end_Date.toISOString().split('T')[0] : '',
                    country: COUNTRY.SINGAPORE,
                    language: LANGUAGE.ENGLISH,
                    is_dummy: IS_DUMMY_STATUS.TRUE,
                }
            }

            console.log('generatePostByAIAPI::: generatePostRequest', generatePostRequest)
            const response = await axios.post(apiUrl, generatePostRequest, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response != undefined) {
                const responseData = plainToInstance(generatePostResponseDTO, response.data);
                console.log("generatePostByAIAPI::: responseData : ", response.data);

                if (responseData.status == POST_RESPONSE.COMPLETED && responseData.posts.length > 0) {
                    console.log("generatePostByAIAPI::: inside POST response completed");
                    await this.savePostDetails(userCredit, responseData)
                }
                else if ((responseData.status == POST_RESPONSE.PROCESSING || responseData.status == POST_RESPONSE.FAILED) || ((responseData.status == POST_RESPONSE.COMPLETED || responseData.status == POST_RESPONSE.SUCCESS) && responseData.posts.length == 0)) {
                    console.log("generatePostByAIAPI::: inside POST response processing");
                    await this.savePostRetry(userCredit[0].user.id, responseData.result_id, responseData.status)
                }
            }
        }
        catch (error) {
            console.log(`error in generatePostByAIAPI: ${error}`);
            throw error;
        }
    }

    private async savePostDetails(userCredit: UserCredit[], generatePostData: generatePostResponseDTO,
    ): Promise<void> {

        // Loop for posts
        try {

            console.log('savePostDetails::: userCredit', userCredit);
            const user = userCredit[0].user;
            if (generatePostData.posts && generatePostData.posts.length > 0) {
                for (const post of generatePostData.posts) {
                    console.log("savePostDetails::: post ", post.id);

                    const sm = userCredit.find(x => x.social_media.platform == post.platform);
                    console.log("savePostDetails:::  sm", sm);

                    if (sm) {

                        // Create post task | Started
                        const postTask = new PostTask();
                        postTask.task_type = POST_TASK_TYPE.AUTO_CREATION;
                        postTask.scheduled_at = new Date(post.post_time);
                        postTask.status = POST_TASK_STATUS.PENDING;
                        postTask.created_By = user.id;
                        postTask.created_at = new Date(post.created_at);
                        postTask.user = user;
                        postTask.modified_date = null;
                        postTask.socialMediaAccount = sm.social_media;
                        postTask.external_post_id = post.id;
                        await this.postTaskRepository.save([postTask]);

                        console.log("savePostDetails::: post task saved: ", postTask);

                        // Create post task | End

                        // Create post || Started
                        console.log("savePostDetails::: post saved started: ");
                        const createPost = new Post();
                        createPost.postTask = postTask;
                        createPost.content = post.text;
                        createPost.hashtags = post.hashtags.join(', ');
                        createPost.created_By = user.id;
                        createPost.created_at = new Date(post.created_at);
                        createPost.no_of_likes = 0;
                        createPost.no_of_comments = 0;
                        createPost.no_of_views = 0;
                        createPost.modified_date = null;

                        console.log("savePostDetails::: post : ", createPost);

                        await this.postRepository.save([createPost]);
                        console.log("savePostDetails::: post save finish", createPost);

                        // Create post || End

                        // Create asset || Started

                        console.log("savePostDetails::: asset save started post.image_url : ", post.image_url);
                        if (post.image_url != "") {
                            const createAsset = new Asset();
                            createAsset.url = post.image_url;
                            createAsset.type = ASSET_TYPE.IMAGE;
                            createAsset.created_By = user.id;
                            createAsset.created_at = new Date(post.created_at);
                            createAsset.modified_date = null;
                            // TODO:
                            // Check if update date is inserting as null or not. Should insert as null
                            createAsset.post = createPost;
                            await this.assetRepository.save([createAsset]);
                            console.log("savePostDetails::: asset save finish createAsset:  ", createAsset)
                        }
                        // Create asset || End
                        console.log("savePostDetails::: after image if");
                    }

                    console.log("savePostDetails::: sm end")
                }
                console.log("savePostDetails::: userCredit.length : ", userCredit.length);
                for (let i = 0; i < userCredit.length; i++) {

                    const element = userCredit[i];
                    console.log(`savePostDetails::: element: ${i}`, element);
                    console.log("savePostDetails::: element.social_media_id in loop ", element.social_media_id)

                    element.social_media = await this.socialMediaAccountRepository.findOne(element.social_media_id);
                    console.log("savePostDetails::: element.social_media ", element.social_media)

                    const userCreditEntity = await this.userCreditRepository.getUserCreditWithSocialMedia(user.id, element.social_media_id);

                    console.log("savePostDetails:::", userCreditEntity, 'userCreditEntity in loop')

                    console.log('savePostDetails::: before credit', userCreditEntity.current_credit_amount)
                    console.log('savePostDetails::: element.social_media.platform', element.social_media.platform)

                    let count = 0;
                    if (element.social_media.platform == SocialMediaPlatformNames[SocialMediaPlatform.FACEBOOK]) {
                        count = generatePostData.posts.filter(x => x.platform == SocialMediaPlatformNames[SocialMediaPlatform.FACEBOOK]).length;
                    }
                    else if (element.social_media.platform == SocialMediaPlatformNames[SocialMediaPlatform.INSTAGRAM]) {
                        count = generatePostData.posts.filter(x => x.platform == SocialMediaPlatformNames[SocialMediaPlatform.INSTAGRAM]).length;
                    }

                    else if (element.social_media.platform == SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN]) {
                        count = generatePostData.posts.filter(x => x.platform == SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN]).length;
                    }
                    else if (element.social_media.platform == SocialMediaPlatformNames[SocialMediaPlatform.TWITTER]) {
                        count = generatePostData.posts.filter(x => x.platform == SocialMediaPlatformNames[SocialMediaPlatform.TWITTER]).length;
                    }

                    userCreditEntity.current_credit_amount = userCreditEntity.current_credit_amount - count;
                    userCreditEntity.last_trigger_date = new Date();
                    console.log('savePostDetails::: after credit', userCreditEntity.current_credit_amount)
                    await this.userCreditRepository.update(userCreditEntity.id, userCreditEntity);
                }
            }
        }
        catch (error) {
            console.log(`savePostDetails::: error in savePostDetails: ${error}`)
            throw error;
        }
    }

    private async savePostRetry(userId: number, /*userCreditId: string,*/ pipelineId: string, status: string) {
        console.log(userId, /*userCreditId, */ pipelineId, status, 'savePostRetry');
        try {
            const postRetry = new PostRetry();
            postRetry.id = generateId(IdType.POST_RETRY);
            postRetry.pipeline_id = pipelineId;
            postRetry.user_id = userId;
            postRetry.modified_date = null;
            postRetry.created_at = new Date();
            postRetry.retry_count = 5;
            postRetry.status = status;

            await this.postRetryRepository.create(postRetry);
            this.scheduleRetry(postRetry); // Call retry scheduling function
        }
        catch (error) {
            console.log(`error in savePostRetry: ${error}`)
        }
    }

    private async scheduleRetry(post: PostRetry) {
        if (post.retry_count <= 0) {
            console.log(`Retries exhausted for post ID ${post.id}`);
            return; // Stop retrying when retry count reaches 0
        }

        console.log(`Scheduling retry for post ID ${post.id} in ${POST_RETRY_COUNT[post.retry_count]} ms DATE: ${new Date()}`);
        setTimeout(() => {
            this.reGeneratePost(post); // Ensuring full function execution
        }, POST_RETRY_COUNT[post.retry_count]);
        // setTimeout(() => {
        //     this.reGeneratePost(post);
        // }, POST_RETRY_COUNT[post.retry_count]);
    }

    private async reGeneratePost(post: PostRetry) {
        try {
            console.log(`Retrying post ID: ${post.id}`);

            const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);
            const apiUrl = secretData.GETAPIURL;
            const token = secretData.TOKEN;

            const response = await axios.request({
                url: apiUrl,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                data: { result_id: post.pipeline_id },
            });

            const newResponse = plainToInstance(generatePostResponseDTO, response.data);
            console.log('Retry API Response:', response.data);

            if (newResponse.status === POST_RESPONSE.SUCCESS) {

                const userCredit = await this.userCreditRepository.getAllUserCredits(post.user_id);
                console.log('reGeneratePost userCredit : ', userCredit);

                try {
                    await this.savePostDetails(userCredit, newResponse);
                }
                catch (error) {
                    console.log(error, 'errorin save')
                }
                post.status = POST_RESPONSE.COMPLETED;
                console.log('updated post1')

                await this.postRetryRepository.update(post.id, post);
                console.log('Post', post)


                console.log(`Post ID ${post.id} marked as COMPLETED`);
            } else if (newResponse.status === POST_RESPONSE.PROCESSING || newResponse.status === POST_RESPONSE.FAILED) {

                post.retry_count -= 1; // Decrement retry count
                await this.postRetryRepository.update(post.id, post);

                console.log(`Post ID ${post.id} count minus: ${post.retry_count}`);
                await this.scheduleRetry(post); // Retry again if count is not zero
            }
        } catch (error) {
            console.log('Error in reGeneratePost:', error);
        }
    }
}
