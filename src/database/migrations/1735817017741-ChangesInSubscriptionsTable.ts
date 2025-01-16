import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInSubscriptionsTable1735817017741 implements MigrationInterface {
    name = 'ChangesInSubscriptionsTable1735817017741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "stripePriceId" character varying`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD "cycle" integer`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD "currency" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD "currency" integer`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP COLUMN "cycle"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "stripePriceId"`);
    }

}
