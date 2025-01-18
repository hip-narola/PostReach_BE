import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Question } from './question.entity';
import { QuestionOption } from './question-option.entity';

@Entity('user_answer')
export class UserAnswer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    question_id: number;

    // @Column({ nullable: true })
    // questionnaire_id: number;

    @Column({ nullable: true })
    question_option_id: number;

    @Column({ nullable: true })
    user_id: number;

    @Column({ nullable: true })
    answer_text: string;

    @ManyToOne(() => Question, (question) => question.id, { nullable: false })
    @JoinColumn({ name: 'question_id' })
    question: Question;

    @ManyToOne(() => QuestionOption, (question_option) => question_option.id, { nullable: true })
    @JoinColumn({ name: 'question_option_id' })
    question_option: QuestionOption;

    // @ManyToOne(() => Questionnaire, (questionnaire) => questionnaire.id, { nullable: true })
    // @JoinColumn({ name: 'questionnaire_id' })
    // questionnaire: Questionnaire;

    @ManyToOne(() => User, (user) => user.id, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at: Date;
}
