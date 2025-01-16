import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { SocialMediaAccount } from './social-media-account.entity';
import { Post } from './post.entity';
import { PostJobLog } from './post-job-log.entity';
import { RejectReason } from './reject-reason.entity';


@Entity('post_task')
export class PostTask {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.id, {})
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => SocialMediaAccount, (user) => user.id, {})
    @JoinColumn({ name: 'social_media_account_id' })
    socialMediaAccount: SocialMediaAccount;

    @Column({ nullable: true })
    task_type: string;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    scheduled_at: Date;

    @Column()
    status: string;

    @Column({ nullable: true })
    rejectReason: string;

    @ManyToOne(() => RejectReason, (reject) => reject.id, {})
    @JoinColumn({ name: 'reject_reason_id' })
    RejectReason: RejectReason;

    @Column()
    created_By: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @Column({ nullable: true })
    modified_By: number;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    modified_date: Date;

    @OneToMany(() => Post, Post => Post.postTask)
    post: Post[];

    @OneToMany(() => PostJobLog, PostJobLog => PostJobLog.postTask)
    PostJobLog: PostJobLog[];

}
