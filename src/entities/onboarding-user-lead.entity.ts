import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('onboarding_user_lead')
export class OnboardingUserLead {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(() => Question, (question) => question.id, { nullable: false })
  // question: Question;

  @Column({ type: 'jsonb', nullable: false })
  answer_id: string; // Using jsonb to store multiple answers

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  user: User;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}
