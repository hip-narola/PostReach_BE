import { IsNumber } from 'class-validator';

export class PostInsightsDTO {
  @IsNumber()
  likes: number;

  @IsNumber()
  no_of_comments: number;

  @IsNumber()
  views: number;
}