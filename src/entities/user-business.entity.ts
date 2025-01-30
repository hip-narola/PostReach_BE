import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	OneToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
	DeleteDateColumn,
	} from 'typeorm';
	import { User } from './user.entity';

	@Entity('user_business')
	export class UserBusiness {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user_id: User;
	
	@Column({ nullable: true })
	image: string;

	@Column({ nullable: true })
	image_url: string;

	@Column({ type: 'varchar', nullable: true })
	brand_name: string;

	@Column({ type: 'text', nullable: true })
	website: string;

	@Column({ type: 'text', nullable: true })
	use: string;

	@Column({ type: 'varchar', nullable: true })
	location: string;

	@Column({ type: 'text', nullable: true })
	overview: string;

	// @Column({ type: 'text' })
	// primary_goals: string;

	// @Column({ type: 'text' })
	// target_audience: string;
	
	// @Column({ type: 'text' })
	// industries: string;

	// @Column({ type: 'text' })
	// voice_content: string;

	// @Column({ type: 'text' })
	// focus: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at: Date;

	@DeleteDateColumn({ type: 'timestamp', nullable: true })
	deleted_at: Date;
	
}