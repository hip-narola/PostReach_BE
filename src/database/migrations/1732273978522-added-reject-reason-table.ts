import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedRejectReasonTable1732273978522 implements MigrationInterface {
    name = 'AddedRejectReasonTable1732273978522'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_task" RENAME COLUMN "rejection_reason" TO "reject_reason_id"`);
        await queryRunner.query(`CREATE TABLE "reject-reasons" ("id" SERIAL NOT NULL, "reason" character varying NOT NULL, CONSTRAINT "PK_d9f8da8a9270bb4305b9c23a09d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "post_task" DROP COLUMN "reject_reason_id"`);
        await queryRunner.query(`ALTER TABLE "post_task" ADD "reject_reason_id" integer`);
        await queryRunner.query(`ALTER TABLE "post_task" ADD CONSTRAINT "FK_b125c9ef847e6cf33f934356832" FOREIGN KEY ("reject_reason_id") REFERENCES "reject-reasons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_task" DROP CONSTRAINT "FK_b125c9ef847e6cf33f934356832"`);
        await queryRunner.query(`ALTER TABLE "post_task" DROP COLUMN "reject_reason_id"`);
        await queryRunner.query(`ALTER TABLE "post_task" ADD "reject_reason_id" character varying`);
        await queryRunner.query(`DROP TABLE "reject-reasons"`);
        await queryRunner.query(`ALTER TABLE "post_task" RENAME COLUMN "reject_reason_id" TO "rejection_reason"`);
    }

}
