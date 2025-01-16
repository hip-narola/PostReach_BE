import { Injectable } from '@nestjs/common';
import { GenericRepository } from './generic-repository';
import { Like, Repository } from 'typeorm';
import { Subscription } from 'src/entities/subscriptions.entity';

@Injectable()
export class SubscriptionRepository extends GenericRepository<Subscription> {
	constructor(repository: Repository<Subscription>) {
		super(repository);
	}

	async findSubscriptionByName(name: string): Promise<Subscription> {
		return this.repository.findOne({
			where: {
				planName: Like(`${name}`)
			}
		});
	}

	async findSubscriptionByPriceId(priceId: string): Promise<Subscription> {
		return this.repository.findOne({
			where: {
				stripePriceId: priceId
			}
		});
	}
	
}
