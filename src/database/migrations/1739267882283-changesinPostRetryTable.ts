import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesinPostRetryTable1739267882283 implements MigrationInterface {
    name = 'ChangesinPostRetryTable1739267882283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post-retry" DROP CONSTRAINT "FK_adc555f68b8c3832532b75d9a88"`);
        await queryRunner.query(`ALTER TABLE "post-retry" DROP COLUMN "credit_id"`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT NULL`);
        // await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "reference_id"`);
        // await queryRunner.query(`ALTER TABLE "question" ADD "reference_id" integer`);
        // await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "FK_558acccac8c4b77c02e7d40d0ce" FOREIGN KEY ("reference_id") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_558acccac8c4b77c02e7d40d0ce"`);
        // await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "reference_id"`);
        // await queryRunner.query(`ALTER TABLE "question" ADD "reference_id" bigint`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "post-retry" ADD "credit_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post-retry" ADD CONSTRAINT "FK_adc555f68b8c3832532b75d9a88" FOREIGN KEY ("credit_id") REFERENCES "user_credit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
