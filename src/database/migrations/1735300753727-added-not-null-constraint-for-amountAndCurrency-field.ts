import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedNotNullConstraintForAmountAndCurrencyField1735300753727 implements MigrationInterface {
    name = 'AddedNotNullConstraintForAmountAndCurrencyField1735300753727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_subscription" ALTER COLUMN "amount" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ALTER COLUMN "currency" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_subscription" ALTER COLUMN "currency" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ALTER COLUMN "amount" SET NOT NULL`);
    }

}
