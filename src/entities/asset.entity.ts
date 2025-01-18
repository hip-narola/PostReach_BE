import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Post } from './post.entity';


@Entity('asset')
export class Asset {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Post, (Post) => Post.id, {})
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @Column()
    url: string;

    @Column()
    type: string;

    @Column()
    created_By: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @Column({ nullable: true })
    modified_By: number;

    @CreateDateColumn({ type: 'timestamp', nullable: true})
    modified_date: Date;

}
