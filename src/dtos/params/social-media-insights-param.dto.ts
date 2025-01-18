import { Column } from 'typeorm';

export class SocialMediaInsightParamDTO {

    @Column()
    platform: string;

    @Column()
    impressions: number;

    @Column()
    newFollowers: number;

    @Column()
    engagements: number;

    @Column()
    social_media_account_id: number;
}
