import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { GenericRepository } from '../repositories/generic-repository';


@Injectable()
export class UnitOfWork {

	private queryRunner: QueryRunner;
	constructor(private readonly dataSource: DataSource) { }

	async startTransaction(): Promise<void> {
		this.queryRunner = this.dataSource.createQueryRunner();
		await this.queryRunner.connect();
		await this.queryRunner.startTransaction();
	}

	async completeTransaction(): Promise<void> {
		try {
			await this.queryRunner.commitTransaction();
		} catch (error) {
			await this.rollbackTransaction();
			throw error;
		} finally {
			await this.queryRunner.release();
			this.queryRunner = null;
		}
	}

	async rollbackTransaction(): Promise<void> {
		try {
			await this.queryRunner.rollbackTransaction();
		} finally {
			await this.queryRunner.release();
			this.queryRunner = null;
		}
	}

	getRepository<T, R extends GenericRepository<T>>(
		repositoryClass: new (repository: Repository<T>, queryRunner?: QueryRunner) => R,
		entityClass: new () => T,
		useTransaction: boolean = false
	): R {
		const repository: Repository<T> = useTransaction
			? this.queryRunner.manager.getRepository(entityClass)
			: this.dataSource.getRepository(entityClass);

		return new repositoryClass(repository, this.queryRunner) as R;
	}

}

