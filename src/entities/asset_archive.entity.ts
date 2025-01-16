import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { PostArchive } from './post_archive.entity';

@Entity('asset_archive')
export class AssetArchive {
    @PrimaryColumn()
    id: string;

    @ManyToOne(() => PostArchive, (Post) => Post.id, {})
    @JoinColumn({ name: 'Post_archive_id' })
    post: PostArchive;

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

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    modified_date: Date;

}
