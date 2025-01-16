import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInUserCreditTable1736225617386 implements MigrationInterface {
    name = 'ChangesInUserCreditTable1736225617386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "current_credit_amount" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "current_credit_amount" SET NOT NULL`);
    }

}
