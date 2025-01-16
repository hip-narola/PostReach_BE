import { MigrationInterface, QueryRunner } from "typeorm";

export class MadeLastTriggerDateFieldNullable1735720365488 implements MigrationInterface {
    name = 'MadeLastTriggerDateFieldNullable1735720365488'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT now()`);
    }

}
