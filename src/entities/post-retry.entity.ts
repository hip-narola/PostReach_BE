import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('post-retry')
export class PostRetry {

    @PrimaryColumn()
    id: string;

    @Column()
    user_id:number;

    @ManyToOne(() => User, user => user.PostRetry)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    pipeline_id: string;

    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    retry_count: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    modified_date: Date;
}

