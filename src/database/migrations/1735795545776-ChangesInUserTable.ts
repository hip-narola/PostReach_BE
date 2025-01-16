import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInUserTable1735795545776 implements MigrationInterface {
    name = 'ChangesInUserTable1735795545776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "stripeCustomerId" character varying`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "stripeCustomerId"`);
    }

}
