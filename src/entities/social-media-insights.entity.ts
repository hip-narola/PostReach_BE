import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
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

    // @Column({ type: 'decimal', precision: 20, scale: 10 }) // High precision for pointed values
    // engagements: number; // Floating-point value
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
    engagements: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updated_at: Date;
}
