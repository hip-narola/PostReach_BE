import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { PostTask } from './post-task.entity';
import { Asset } from './asset.entity';


@Entity('post')
export class Post {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => PostTask, (PostTask) => PostTask.id, {})
    @JoinColumn({ name: 'post_task_id' })
    postTask: PostTask;

    @Column({ nullable: true })
    external_platform_id: string;

    @Column({ default: 0 })
    no_of_likes: number;

    @Column({ default: 0 })
    no_of_comments: number;

    @Column({ default: 0 })
    no_of_views: number;

    @Column({ nullable: true })
    content: string;

    @Column({ nullable: true })
    hashtags: string;

    @Column()
    created_By: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @Column({ nullable: true })
    modified_By: number;

    @CreateDateColumn({ type: 'timestamp',nullable: true })
    modified_date: Date;

    @OneToMany(() => Asset, Asset => Asset.post)
    assets: Asset[];
    
}
