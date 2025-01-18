import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { Asset } from './asset.entity';
import { User } from './user.entity';

@Entity('post_archive')
export class PostArchive {
    @PrimaryColumn()
    id: string;

    @ManyToOne(() => User, (user) => user.id, {})
    @JoinColumn({ name: 'user_id' })
    user: User;

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

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    modified_date: Date;

    @OneToMany(() => Asset, Asset => Asset.post)
    assets: Asset[];

}
