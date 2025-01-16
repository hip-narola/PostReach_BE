import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { SocialMediaAccount } from './social-media-account.entity';

@Entity('social_media_insights')
export class SocialMediaInsight {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => SocialMediaAccount, (social) => social.id, {})
    @JoinColumn({ name: 'socia_media_account_id' })
    socialMediaAccount: SocialMediaAccount;

    @Column()
    impressions: number;

    @Column()
    newFollowers: number;

    @Column()
    engagements: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}
