
import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	DeleteDateColumn,
} from 'typeorm';
import { Question } from './question.entity';

@Entity('questionnaire')
export class Questionnaire {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', nullable: false })
	name: string;

	@Column({ type: 'varchar', nullable: true })
	image_name: string;

	@Column({ nullable: true })
	duration: number;

	@Column({ type: 'boolean', default: true })
	is_active: boolean;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at: Date;

	@DeleteDateColumn({ type: 'timestamp', nullable: true })
	deleted_at: Date;

	@OneToMany(() => Question, (question) => question.questionnaire)
	questions: Question[];
}