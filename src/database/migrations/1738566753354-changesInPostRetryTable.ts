import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInPostRetryTable1738566753354 implements MigrationInterface {
    name = 'ChangesInPostRetryTable1738566753354'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post-retry" DROP CONSTRAINT "PK_a13954ef305ea6a2468dd988d79"`);
        await queryRunner.query(`ALTER TABLE "post-retry" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "post-retry" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post-retry" ADD CONSTRAINT "PK_a13954ef305ea6a2468dd988d79" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post-retry" DROP CONSTRAINT "PK_a13954ef305ea6a2468dd988d79"`);
        await queryRunner.query(`ALTER TABLE "post-retry" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "post-retry" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post-retry" ADD CONSTRAINT "PK_a13954ef305ea6a2468dd988d79" PRIMARY KEY ("id")`);
    }

}
