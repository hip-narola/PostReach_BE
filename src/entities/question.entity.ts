import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	DeleteDateColumn,
	OneToMany,
	JoinColumn,
} from 'typeorm';
import { Questionnaire } from './questionnaire.entity';
import { QuestionOption } from './question-option.entity';
import { QuestionValidator } from './question-validator.entity';
import { UserAnswer } from './user-answer.entity';

@Entity('question')
export class Question {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', nullable: true })
	question: string;

	@Column({ type: 'varchar', nullable: true })
	question_type: string;

	@Column({ type: 'bigint', nullable: true })
	questionnaire_id: number;

	@Column({ type: 'bigint', nullable: true })
	question_validator_id: number;

	@Column({ type: 'varchar', nullable: true })
	control_label: string;

	@Column({ type: 'varchar', nullable: true })
	control_placeholder: string;

	@Column({ type: 'text', nullable: true })
	question_description: string;

	@Column({ type: 'int', nullable: true })
	question_order: number;

	@Column({ type: 'bigint' })
	step_id: number;

	@Column({ type: 'bigint', nullable: true })
	reference_id: number;

	@Column({ type: 'boolean', default: true })
	is_required: boolean;

	@Column({ type: 'boolean', default: true })
	is_active: boolean;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at: Date;

	@DeleteDateColumn({ type: 'timestamp', nullable: true })
	deleted_at: Date;

	@ManyToOne(() => Questionnaire, (questionnaire) => questionnaire.questions, { nullable: false })
	@JoinColumn({ name: 'questionnaire_id' })
	questionnaire: Questionnaire;

	@ManyToOne(() => QuestionValidator, (questionValidator) => questionValidator.id, { nullable: false })
	@JoinColumn({ name: 'question_validator_id' })
	questionValidator: QuestionValidator;

	@OneToMany(() => QuestionOption, (option) => option.question)
	options: QuestionOption[];

	@OneToMany(() => UserAnswer, (userAnswer) => userAnswer.question)
	answer: UserAnswer[];
}