import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Question } from './question.entity';

@Entity('question_validator')
export class QuestionValidator {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', nullable: true })
    name: string;

    @Column({ type: 'varchar', nullable: true })
    regex: string;

    @Column({ type: 'bigint', nullable: true })
    min: number;

    @Column({ type: 'bigint', nullable: true })
    max: number;

    @Column({ type: 'varchar', nullable: true })
    message: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at: Date;

    @OneToMany(() => Question, (question) => question.question_validator_id, {nullable: true}  )
	question: Question[];
}