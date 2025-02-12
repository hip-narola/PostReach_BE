import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesinPostTaskAndRejectReasonTable1739279260324 implements MigrationInterface {
    name = 'ChangesinPostTaskAndRejectReasonTable1739279260324'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reject-reasons" ADD "isDisplay" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "post_task" ADD "external_post_id" character varying`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "post_task" DROP COLUMN "external_post_id"`);
        await queryRunner.query(`ALTER TABLE "reject-reasons" DROP COLUMN "isDisplay"`);
    }

}
