import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Subscription } from './subscriptions.entity';

@Entity('user_subscription')
export class UserSubscription {

    @PrimaryColumn()
    id: string;

    @ManyToOne(() => Subscription, (subscription) => subscription.id, {})
    @JoinColumn({ name: 'subscription_id' })
    subscription: Subscription;

    @ManyToOne(() => User, (user) => user.id, {})
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ nullable: true })
    stripe_subscription_id?: string;

    @Column( {nullable: true, default: () => 'NULL'} )
    status: string;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    start_Date: Date;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    end_Date: Date;

    @Column({ nullable: true })
    cycle?: number;
}
