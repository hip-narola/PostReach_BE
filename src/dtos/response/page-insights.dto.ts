import { IsNumber } from 'class-validator';

export class PageInsightsDTO {
  @IsNumber()
  impressions: number;

  @IsNumber()
  engagements: string;

  @IsNumber()
  followers: number;
}
