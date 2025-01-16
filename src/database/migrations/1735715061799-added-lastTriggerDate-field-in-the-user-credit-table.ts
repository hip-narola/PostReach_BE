import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedLastTriggerDateFieldInTheUserCreditTable1735715061799 implements MigrationInterface {
    name = 'AddedLastTriggerDateFieldInTheUserCreditTable1735715061799'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ADD "last_trigger_date" TIMESTAMP DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" DROP COLUMN "last_trigger_date"`);
    }

}
