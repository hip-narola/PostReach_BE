import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInUserCreditTable1736242655559 implements MigrationInterface {
    name = 'ChangesInUserCreditTable1736242655559'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" DROP COLUMN "initial_credit_amount"`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD "initial_credit_amount" integer NOT NULL`);
    }

}
