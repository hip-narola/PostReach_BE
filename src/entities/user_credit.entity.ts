import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Subscription } from './subscriptions.entity';
import { SocialMediaAccount } from './social-media-account.entity';

@Entity('user_credit')
export class UserCredit {

    @PrimaryColumn()
    id: string;

    @ManyToOne(() => User, (user) => user.id, {})
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ nullable: true })
    social_media_id: number;

    @ManyToOne(() => SocialMediaAccount, (socialMediaAccount) => socialMediaAccount.id, { nullable: false })
    @JoinColumn({ name: 'social_media_id' })
    social_media: SocialMediaAccount;

    @ManyToOne(() => Subscription, (subscription) => subscription.id, {})
    @JoinColumn({ name: 'subscription_id' })
    subscription: Subscription;

    @Column({ nullable: true })
    current_credit_amount: number;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    start_Date: Date;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    end_Date: Date;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    cancel_Date: Date;

    @CreateDateColumn({ type: 'timestamp', nullable: true, default: () => 'NULL' })
    last_trigger_date: Date;

    @Column( {nullable: true, default: () => 'NULL'} )
    status: string;
}
