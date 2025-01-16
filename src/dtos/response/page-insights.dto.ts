import { IsNumber } from 'class-validator';

export class PageInsightsDTO {
  @IsNumber()
  impressions: number;

  @IsNumber()
  engagements: number;

  @IsNumber()
  followers: number;
}
