import { Column } from 'typeorm';

export class SocialMediaInsightParamDTO {

    @Column()
    platform: string;

    @Column()
    impressions: number;

    @Column()
    newFollowers: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: () => 0})
    engagements: number;  // Ensuring decimal storage with 2 places

    @Column()
    social_media_account_id: number;
}
