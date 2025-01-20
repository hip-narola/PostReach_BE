export class CreatePostTaskDto {
    userId: number;
    socialMediaAccountId: number;
    taskType: string;
    scheduledAt: Date;
    status: string;
    createdBy: number;
  }