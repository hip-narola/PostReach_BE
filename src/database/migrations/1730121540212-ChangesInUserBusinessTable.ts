import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInUserBusinessTable1730121540212 implements MigrationInterface {
    name = 'ChangesInUserBusinessTable1730121540212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_business" ADD "image" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "image"`);
    }

}
