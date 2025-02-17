import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { PostTask } from './post-task.entity';
import { UserCredit } from './user_credit.entity';
import { UserSubscription } from './user_subscription.entity';

@Entity('social_media_accounts')
export class SocialMediaAccount {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number; // Foreign key

    @Column({ nullable: true })
    page_id: string;

    @Column({ nullable: true })
    instagram_Profile: string;

    @Column({ nullable: true })
    facebook_Profile: string;

    @Column({ nullable: true })
    facebook_Profile_access_token: string;

    @Column()
    platform: string;

    @Column({ nullable: true })
    token_type?: string;

    @Column({ nullable: true })
    encrypted_access_token: string;

    @Column({ nullable: true })
    encryption_key_id?: string;

    @Column({ nullable: true })
    refresh_token: string;

    @Column({ nullable: true })
    expires_in: number;

    @Column({ nullable: true })
    scope: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    user_name: string;

    @Column({ nullable: true })
    user_profile: string;

    @Column({ nullable: true })
    file_name: string;

    @Column({ nullable: true })
    social_media_user_id: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    connected_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true, default: null })
    updated_at: Date;

    @Column({ default: false })
    isDisconnect: boolean;

    @ManyToOne(() => User, user => user.socialMediaAccounts)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => PostTask, (postTask) => postTask.socialMediaAccount)
    postTasks: PostTask[];

    @OneToMany(() => UserCredit, (userCredit) => userCredit.social_media)
    userCredits: UserCredit[];

    @OneToMany(() => UserSubscription, (userSubscription) => userSubscription.user)
    @JoinColumn({ name: 'user_id' })
    userSubscriptions: UserSubscription[];
}
