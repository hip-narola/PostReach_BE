import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToOne,
	OneToMany,
	JoinColumn,
} from 'typeorm';
import { SocialMediaAccount } from './social-media-account.entity';
import { UserBusiness } from './user-business.entity';
import { UserAnswer } from './user-answer.entity';
import { UserSubscription } from './user_subscription.entity';
import { UserCredit } from './user_credit.entity';
import { PostRetry } from './post-retry.entity';
@Entity()

export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	name: string;

	@Column()
	cognitoId: string;

	@Column()
	email: string;

	@Column({ nullable: true })
	socialMediaId: string;

	@Column({ nullable: true })
	profilePicture: string;

	@Column({ nullable: true })
	profilePictureUrl: string;

	@Column({ nullable: true })
	phone: string;

	@Column({ default: true })
	isActive: boolean;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;

	@OneToOne(() => UserBusiness, (userBusiness) => userBusiness.user_id)
	userBusiness: UserBusiness;

	@OneToMany(() => SocialMediaAccount, socialMediaAccount => socialMediaAccount.user)
	socialMediaAccounts: SocialMediaAccount[];

	@OneToMany(() => UserAnswer, userAnswer => userAnswer.user)
	userAnswers: UserAnswer[];

	@Column({ nullable: true })
	stripeCustomerId: string;

	@OneToMany(() => UserSubscription, (userSubscription) => userSubscription.user)
	@JoinColumn({ name: 'user_id' })
	userSubscriptions: UserSubscription[];

	@OneToMany(() => UserCredit, (userCredit) => userCredit.user)
	@JoinColumn({ name: 'user_id' })
	userCredits: UserCredit[];
	
	@OneToMany(() => PostRetry, (postRetry) => postRetry.user)
	@JoinColumn({ name: 'user_id' })
	PostRetry: PostRetry;

}