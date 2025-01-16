import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedReasonField1732525466060 implements MigrationInterface {
    name = 'AddedReasonField1732525466060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_task" ADD "rejectReason" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_task" DROP COLUMN "rejectReason"`);
    }

}
