import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('subscriptions')
export class Subscription {

    @PrimaryColumn()
    id: string;

    @Column({ type: 'varchar', length: 255 })
    planName: string;

    @Column()
    planType: number;

    @Column()
    amount: number;

    @Column()
    creditAmount: number;

    @Column({ nullable: true })
    stripePriceId: string;

}
