import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    user_id: number; // Foreign key

    @ManyToOne(() => User, (user) => user.id, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    type: string;

    @Column()
    content: string;

    @Column({ default: false })
    is_read: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    modified_at: Date;
}