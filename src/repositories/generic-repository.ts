import { DeleteResult, FindOneOptions, FindOptionsWhere, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class GenericRepository<T> {
    constructor(
        protected readonly repository: Repository<T>,
        private readonly queryRunner?: QueryRunner
    ) { }

    private getEntityManager() {
        return this.queryRunner ? this.queryRunner.manager : this.repository.manager;
    }

    async create(data: T): Promise<T> {
        const entity = this.repository.create(data);
        return await this.getEntityManager().save(entity);
    }

    async save(entities: T[]): Promise<T[]> {
        // Add a save method to persist multiple entities
        return await this.getEntityManager().save(entities);
    }

    save1(entities: T[]) {
        // Add a save method to persist multiple entities
        return this.getEntityManager().save(entities);
    }

    async findOne(id: number|string): Promise<T | null> {
        const options: FindOptionsWhere<T> = { id } as unknown as FindOptionsWhere<T>;
        return await this.getEntityManager().findOne(this.repository.target, { where: options });
    }
    async update(id: string | number, data: QueryDeepPartialEntity<T>): Promise<UpdateResult> {
        return await this.getEntityManager().update(this.repository.target, id, data);
    }
    async delete(id: number): Promise<void> {
        await this.getEntityManager().delete(this.repository.target, id);
    }

    async findAll(): Promise<T[]> {
        return await this.getEntityManager().find(this.repository.target);
    }
   
    async findAllWithRelation(options: { relations?: string[] } = {}): Promise<T[]> {
        return await this.getEntityManager().find(this.repository.target, options);
    }
    
    // Method to find an entity by any field (e.g., 'email', 'name', etc.)
    async findByField(fieldName: keyof T, value: any): Promise<T | undefined> {
        const options: FindOptionsWhere<T> = { [fieldName]: value } as FindOptionsWhere<T>;
        return this.repository.findOne({ where: options });
    }

    async findOneByFields(options: FindOneOptions<T>): Promise<T | null> {
        return await this.getEntityManager().findOne(this.repository.target, options);
    }

    async findByFields(options: FindOneOptions<T>): Promise<T[]> {
        return await this.getEntityManager().find(this.repository.target, options);
    }
    async deleteByFields(where: FindOptionsWhere<T>): Promise<DeleteResult> {
        return await this.getEntityManager().delete(this.repository.target, where);
    }
}
