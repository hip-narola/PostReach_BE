import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedJobIdNumberToString1739776330843 implements MigrationInterface {
    name = 'ChangedJobIdNumberToString1739776330843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post-job-log" DROP COLUMN "job_id"`);
        await queryRunner.query(`ALTER TABLE "post-job-log" ADD "job_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post-job-log" DROP COLUMN "job_id"`);
        await queryRunner.query(`ALTER TABLE "post-job-log" ADD "job_id" integer NOT NULL`);
    }

}
