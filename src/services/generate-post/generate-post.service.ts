import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { GeneratePostPipelineRequestDTO, Mode, SocialPostNumberDTO, UserInfoDTO, UserInfoType } from 'src/dtos/params/generate-post-param.dto';
import { generatePostResponseDTO, PostDTO } from 'src/dtos/response/generate-post-response.dto';
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

    // TODO: Call generatePostByAIAPI function where ever createPostForSubscription is called
    async generatePostByAIAPI(userCredit: UserCredit): Promise<void> {
        try {
            console.log(userCredit, 'userCredit')
            // TODO :

            // userCredit: dto for user credit - Required

            /*
                Create one function in user repository and call it here (Should return all value below in function use join)
               
                function will take userid, social media account id will be get from user credit object
                from user id you will get onboarding question and their answers
                get bussines preference of user
                get connected social media account detail by social media account id
            */
            // const userRepository = this.unitOfWork.getRepository(UserRepository, User, false);
            console.log(userCredit.social_media_id, 'userCredit.socialMediaId');
            userCredit.social_media = await this.socialMediaAccountRepository.findOne(userCredit.social_media_id);

            console.log(userCredit.social_media.platform, 'platform')

            const details = await this.userRepository.findUserAnswersWithQuestionsAndSocialMedia(userCredit.user.id, userCredit.social_media_id);

            console.log(details, 'details')
            // After getting records of social media, on-boarding, bussiness preference.
            //  Generate object for GeneratePostPipelineRequestDTO
            // Bind data from these info
            const userInfo: UserInfoDTO[] = details?.userAnswers?.map((answer: any) => ({
                name: answer.question?.questionName || '',
                value: answer.answerText || '',
                type: UserInfoType.TEXT,
                isUrl: answer.question?.questionName == 'personal_website',
            })) || [];

            console.log(userInfo, 'userInfo');

            //generate post only for left days of subscription
            const daysDifference = (Math.floor(Math.abs(new Date(details.userSubscription.end_Date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) + 1;
            console.log(Math.abs(new Date(details.userSubscription.end_Date).getTime()), 'Math.abs(new Date(details.userSubscription.end_Date).getTime()', new Date().getTime());
            console.log(daysDifference, 'daysDifference');

            let PostRequestCount;
            const today = new Date();
            const subscriptionStart = new Date(details.userSubscription.start_Date);
            const subscriptionValidDate = new Date(subscriptionStart);
            subscriptionValidDate.setDate(subscriptionValidDate.getDate() + 14);
            console.log(today, subscriptionStart, subscriptionValidDate, 'today, subscriptionStart, subscriptionValidDate');

            if (details.userSubscription.cycle == 0) {
                console.log('cycle0')
                if (userCredit.current_credit_amount >= daysDifference) {
                    console.log('PostRequestCount = daysDifference', daysDifference);
                    PostRequestCount = daysDifference;
                }
            }
            else if (details.userSubscription.cycle == 1) {
                console.log('cycle==1')

                if (today >= subscriptionValidDate && userCredit.current_credit_amount > daysDifference) {
                    console.log('today >= subscriptionValidDate && userCredit.currentCreditAmount > daysDifference', daysDifference)
                    PostRequestCount = daysDifference;
                } else {
                    if (userCredit.last_trigger_date != null) {
                        console.log('userCredit.lastTriggerDate != null', userCredit.current_credit_amount)
                        PostRequestCount = userCredit.current_credit_amount;
                    }
                    else {
                        console.log('cycle==1 if else else', userCredit.current_credit_amount / 2)
                        PostRequestCount = userCredit.current_credit_amount / 2;
                    }
                }
            }
            else if (details.userSubscription.cycle >= 2) {
                console.log('cycle>=2')

                if (today >= subscriptionValidDate && userCredit.current_credit_amount > daysDifference) {
                    console.log('today >= subscriptionValidDate && userCredit.current_credit_amount > daysDifference', daysDifference)
                    PostRequestCount = daysDifference;
                }
                else {
                    console.log('cycle>=2 else', userCredit.current_credit_amount)
                    PostRequestCount = userCredit.current_credit_amount;
                }
            }
            else {
                console.log('else', userCredit.current_credit_amount)
                PostRequestCount = userCredit.current_credit_amount;
            }
            console.log(PostRequestCount, 'PostRequestCount')
            const socialPostNumber: SocialPostNumberDTO = {
                facebook_posts_number: userCredit.social_media.platform == SocialMediaPlatformNames[SocialMediaPlatform.FACEBOOK] ? PostRequestCount : 0,
                linkedin_posts_number: userCredit.social_media.platform == SocialMediaPlatformNames[SocialMediaPlatform.LINKEDIN] ? PostRequestCount : 0,
                twitter_posts_number: userCredit.social_media.platform == SocialMediaPlatformNames[SocialMediaPlatform.TWITTER] ? PostRequestCount : 0,
                instagram_posts_number: userCredit.social_media.platform == SocialMediaPlatformNames[SocialMediaPlatform.INSTAGRAM] ? PostRequestCount : 0,
            };
            console.log(socialPostNumber, 'socialPostNumber')

            const generatePostRequest: GeneratePostPipelineRequestDTO = {
                mode: Mode.AUTOPILOT,
                social_post_number: socialPostNumber,
                user_info: userInfo,
                schedule_start_date: userCredit?.start_Date ? userCredit.start_Date.toISOString().split('T')[0] : '',
                schedule_end_date: userCredit?.end_Date ? userCredit.end_Date.toISOString().split('T')[0] : '',
                country: COUNTRY.SINGAPORE,
                language: LANGUAGE.ENGLISH,
                is_dummy: IS_DUMMY_STATUS.TRUE,
            };
            console.log(generatePostRequest, 'generatePostRequest')


            // // TODO : Add URL in AWS
            // const apiUrl = 'https://postreachai-ekc4e7fke7bacehe.southeastasia-01.azurewebsites.net/api/v1/pipeline/generate_dummy';
            // // TODO : Get token from AWS
            // const token = '';

            const secretData = await this.secretService.getSecret(AWS_SECRET.AWSSECRETNAME);

            const apiUrl = secretData.APIURL;
            const token = secretData.TOKEN;
            console.log(apiUrl, token, 'apiUrl, token')
            let response;
            try {
                response = await axios.post(apiUrl, generatePostRequest, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
            }
            catch (error) {
                console.log(error, 'error')
            }
            if (response != undefined) {
                const responseData = plainToInstance(generatePostResponseDTO, response.data);
                console.log(responseData, 'responseData');

                // // TODO : Bind responseData in to one object and pass it to savePostDetails function
                // // call savePostDetails function

                if (responseData.status == POST_RESPONSE.COMPLETED) {
                    console.log('SUCCESS here1')
                    await this.savePostDetails(userCredit, responseData)

                }
                else if ((responseData.status == POST_RESPONSE.PROCESSING && responseData.posts.length == 0) || responseData.status == POST_RESPONSE.FAILED) {
                    console.log(' PROCESSINGhere1')
                    await this.savePostRetry(userCredit.user.id, userCredit.id, responseData.result_id, responseData.status)
                }
                else {
                    console.log('else1');
                }
            }

        } catch (error) {
            console.log(error, 'error');
            throw error;
        }
    }

    private async savePostDetails(
        // userId: number,
        // socialMediaAccountDetails: SocialMediaAccount,
        // platformId: number,
        // subscriptionId: string,
        userCredit: UserCredit,
        generatePostData: generatePostResponseDTO,
    ): Promise<void> {
        // TODO: 2 Request parameter dto of responseData and dto of new function which is created at 1st 
        // get all required data based this dto
        // you will get user id, social media id  
        // Loop for posts
        try {
            // const existingUser = await this.userRepository.findOne(userCredit.user);
            // const socialMediaAccountDetails = await this.socialMediaAccountRepository.findOne(socialMediaAccountId);
            console.log(userCredit, 'userCredit');
            const user = userCredit.user;
            if (generatePostData.posts && generatePostData.posts.length > 0) {
                for (const post of generatePostData.posts) {

                    // const postTaskRepository = this.unitOfWork.getRepository(PostTaskRepository, PostTask, true);
                    // const postRepository = this.unitOfWork.getRepository(PostRepository, Post, true);
                    // const userRepository = this.unitOfWork.getRepository(UserRepository, User, false);
                    // const socialMediaRepository = this.unitOfWork.getRepository(SocialMediaAccountRepository, SocialMediaAccount, false);
                    // const assestRepository = this.unitOfWork.getRepository(AssetRepository, Asset, true);

                    // Create post task | Started
                    const postTask = new PostTask();
                    postTask.task_type = POST_TASK_TYPE.AUTO_CREATION;
                    postTask.scheduled_at = new Date(post.post_time);
                    postTask.status = POST_TASK_STATUS.PENDING;
                    postTask.created_By = user.id;
                    postTask.created_at = new Date(post.created_at);
                    postTask.user = user;
                    postTask.modified_date = null;
                    // TODO: 
                    // assign social media id -> get id from both dtos (do not add loop get id by filter)
                    // Check if update date is inserting as null or not. Should insert as null
                    postTask.socialMediaAccount = userCredit.social_media;
                    await this.postTaskRepository.save([postTask]);
                    console.log(postTask, 'postTask')

                    // Create post task | End

                    // Create post || Started
                    const createPost = new Post();
                    createPost.postTask = postTask;
                    createPost.content = post.text;
                    createPost.hashtags = post.hashtags.join(', ');
                    createPost.created_By = user.id;
                    createPost.created_at = new Date(post.created_at);
                    // createPost.postTask = postTask;
                    createPost.no_of_likes = 0;
                    createPost.no_of_comments = 0;
                    createPost.no_of_views = 0;
                    createPost.modified_date = null;
                    console.log(createPost, 'before createPost')
                    // TODO:
                    // Check if update date is inserting as null or not. Should insert as null
                    await this.postRepository.save([createPost]);
                    console.log(createPost, 'after createPost')

                    // Create post || End

                    // Create asset || Started
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
                        console.log(createAsset, 'createAsset')
                    }
                    // Create asset || End

                }
                const userCreditEntity = await this.userCreditRepository.findOne(userCredit.id);
                console.log('before credit', userCreditEntity.current_credit_amount)

                userCreditEntity.current_credit_amount = userCreditEntity.current_credit_amount - generatePostData.posts.length;
                console.log('after credit', userCreditEntity.current_credit_amount)
                await this.userCreditRepository.update(userCreditEntity.id, userCreditEntity);
            }
        }
        catch (error) {
            console.log(error, 'error789')
            throw error;
        }
    }

    private async savePostRetry(userId: number, userCreditId: string, pipelineId: string, status: string) {
        console.log(userId, userCreditId, pipelineId, status, 'savePostRetry');

        const postRetry = new PostRetry();
        postRetry.id = generateId(IdType.POST_RETRY);
        postRetry.pipeline_id = pipelineId;
        postRetry.user_id = userId;
        postRetry.credit_id = userCreditId;
        postRetry.modified_date = null;
        postRetry.created_at = new Date();
        postRetry.retry_count = 5;
        postRetry.status = status;

        await this.postRetryRepository.create(postRetry);

        this.scheduleRetry(postRetry); // Call retry scheduling function
    }

    private async scheduleRetry(post: PostRetry) {
        if (post.retry_count <= 0) {
            console.log(`Retries exhausted for post ID ${post.id}`);
            return; // Stop retrying when retry count reaches 0
        }

        console.log(`Scheduling retry for post ID ${post.id} in ${POST_RETRY_COUNT[post.retry_count]} ms DATE: ${new Date()}`);
        setTimeout(async () => {
            await this.reGeneratePost(post); // Ensuring full function execution
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

            const userCredit = await this.userCreditRepository.findOneCredit(post.credit_id);
            console.log(userCredit, 'userCredit');

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
            console.log('API Response:', newResponse);

            if (newResponse.status === POST_RESPONSE.SUCCESS) {


                if (post.retry_count == 1) {
                    console.log("dummy_response set for retry count 1");
                    const responseData = newResponse;

                    if (responseData.status != POST_RESPONSE.COMPLETED) {
                        responseData.result_id = 'pipeline-25a07b0a-cbf3-43e7-b0b6-bf088a5b5f4f';
                        responseData.status = 'completed';
                        responseData.completed_at = '2025-01-22T06:13:27.096547';

                        const postDto = plainToInstance(PostDTO, {
                            "id": "post-39e392be-d9f3-4c46-87df-f382221dc833",
                            "platform": userCredit.social_media.platform,
                            "language": "English",
                            "text": "The Art of Coffee Roasting: A Journey Through Downtown Seattle's Coffee Culture. As a coffee enthusiast, have you ever wondered what goes into creating the perfect cup of coffee? From bean selection to roasting, the process is an art form. In downtown Seattle, local coffee shops like Victrola Coffee are dedicated to serving high-quality, expertly roasted coffee. With a focus on sustainability and community, Victrola Coffee is a must-visit destination for coffee lovers. Learn more about their story and commitment to quality at https://www.victrolacoffee.com/pages/our-story. As we explore the art of coffee roasting, we'll delve into the world of coffee brewing and roasting, highlighting the techniques and traditions that make Seattle's coffee scene so unique. From pour-overs to lattes, we'll examine the role of coffee in bringing people together and fostering a sense of community. Whether you're a remote worker, a local resident, or just visiting downtown Seattle, we invite you to join us on this journey through the city's vibrant coffee culture. With a focus on quality, sustainability, and community, we'll discover what makes Seattle's coffee shops so special and how they contribute to the city's thriving food and beverage scene. So grab a cup of your favorite coffee and let's dive into the world of coffee roasting and brewing, as we explore the sights, sounds, and flavors of downtown Seattle's coffee culture. As Morning Brew, we're committed to promoting local coffee shops and increasing customer engagement, and we're excited to share this journey with you. Join the conversation and let us know what you love about coffee and Seattle's coffee culture. Use the hashtags to share your thoughts and photos, and let's work together to build a stronger, more vibrant coffee community. Published on 2025-01-22.",
                            "hashtags": [
                                "#CoffeeLove",
                                "#SeattleCoffee"
                            ],
                            "image_url": "social_media_images/facebook_post_images/e62e69d1-f1ad-46b5-95a2-bbf05f1ac8f4.png",
                            "image_prompt": "A warm and inviting photograph of a skilled barista expertly roasting coffee beans in a cozy coffee shop, with a photorealistic style, set against the backdrop of a bustling downtown Seattle street, illuminated by the soft, golden light of morning, with a color palette featuring rich browns, creamy whites, and deep blues, evoking a sense of comfort and community, and a composition that places the barista in the center of the frame, surrounded by bags of freshly roasted coffee beans, with a few customers blurred in the background, engaged in conversation, and the Victrola Coffee logo subtly integrated into the scene, conveying a sense of warmth, professionalism, and a passion for coffee, that captures the essence of Seattle's vibrant coffee culture and the art of coffee roasting.",
                            "context": "{'title': \"The Art of Coffee Roasting: A Journey Through Downtown Seattle's Coffee Culture\", 'content': \"As a coffee enthusiast, have you ever wondered what goes into creating the perfect cup of coffee? From bean selection to roasting, the process is an art form. In downtown Seattle, local coffee shops like Victrola Coffee are dedicated to serving high-quality, expertly roasted coffee. With a focus on sustainability and community, Victrola Coffee is a must-visit destination for coffee lovers. Learn more about their story and commitment to quality at https://www.victrolacoffee.com/pages/our-story. As we explore the art of coffee roasting, we'll delve into the world of coffee brewing and roasting, highlighting the techniques and traditions that make Seattle's coffee scene so unique. From pour-overs to lattes, we'll examine the role of coffee in bringing people together and fostering a sense of community. Whether you're a remote worker, a local resident, or just visiting downtown Seattle, we invite you to join us on this journey through the city's vibrant coffee culture. With a focus on quality, sustainability, and community, we'll discover what makes Seattle's coffee shops so special and how they contribute to the city's thriving food and beverage scene. So grab a cup of your favorite coffee and let's dive into the world of coffee roasting and brewing, as we explore the sights, sounds, and flavors of downtown Seattle's coffee culture. As Morning Brew, we're committed to promoting local coffee shops and increasing customer engagement, and we're excited to share this journey with you. Join the conversation and let us know what you love about coffee and Seattle's coffee culture. Use the hashtags #CoffeeLove #SeattleCoffee #MorningBrew to share your thoughts and photos, and let's work together to build a stronger, more vibrant coffee community. Published on 2025-01-22.\", 'source_url': 'https://www.victrolacoffee.com/pages/our-story', 'published_date': '2025-01-22'}",
                            "user_story": "business_name: Morning Brew\nlocation: downtown Seattle\nindustry: Food & Beverage\ngoal: Promote local coffee shop and increase customer engagement\ntarget_audience: Coffee enthusiasts, remote workers, and local residents\ntone: Warm and professional\nusage: Social media marketing\nurl: https://www.victrolacoffee.com/pages/our-story\nkeywords: ['Coffee', 'Brewing', 'Roasting']",
                            "post_time": "2025-02-07T16:29:03.960088",
                            "social_task_version": 1,
                            "image_prompt_generation_task_version": 1,
                            "post_word_count": 1000,
                            "image_prompt_word_count": 1000,
                            "hashtag_number": 2,
                            "created_at": "2025-02-04T06:13:04.204471",
                            "updated_at": "2025-02-04T06:13:04.204474",
                            "metadata": null
                        });

                        for (let i = 0; i < userCredit.current_credit_amount; i++) {
                            responseData.posts.push(postDto);
                        }
                        console.log("dummy_response : ", responseData);
                        return;
                    }
                }

                await this.savePostDetails(userCredit, newResponse);
                post.status = POST_RESPONSE.COMPLETED;
                await this.postRetryRepository.update(post.id, post);


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
