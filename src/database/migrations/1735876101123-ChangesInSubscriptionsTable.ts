import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInSubscriptionsTable1735876101123 implements MigrationInterface {
    name = 'ChangesInSubscriptionsTable1735876101123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD "currency" character varying`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD "amount" integer`);
    }

}
