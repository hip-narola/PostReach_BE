import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PostTask } from './post-task.entity';


@Entity('post-job-log')
export class PostJobLog {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => PostTask, (PostTask) => PostTask.id, {})
    @JoinColumn({ name: 'post_task_id' })
    postTask: PostTask;

    @Column()
    job_id: number;

    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    retry_count: number;

    @Column({ nullable: true })
    error_message: string;

    @Column()
    created_By: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @Column({ nullable: true })
    modified_By: number;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    modified_date: Date;

}
