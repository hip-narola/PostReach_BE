import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reject-reasons')
export class RejectReason {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    reason: string;

    @Column({ nullable: true, default: false })
    isDisplay: boolean;
}
