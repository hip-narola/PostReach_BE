import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { Question } from './question.entity';

@Entity('question_option')
export class QuestionOption {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    question_id: number; // Foreign key

    @Column({ type: 'text' })
    name: string;

    @Column({ nullable: true })
    sub_question_id: number; // Foreign key

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at: Date;

    @ManyToOne(() => Question, (question) => question.options, { nullable: true })
    @JoinColumn({ name: 'question_id' })
    question: Question;

    @ManyToOne(() => Question, { nullable: true })
    @JoinColumn({ name: 'sub_question_id' })
    sub_question: Question;

}
