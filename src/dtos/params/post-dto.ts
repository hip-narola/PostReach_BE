// dto/create-post.dto.ts
export class CreatePostDto {
    postTaskId: number;
    externalPlatformId: string;
    content: string;
    hashtags: string;
    createdBy: number;
  }
  