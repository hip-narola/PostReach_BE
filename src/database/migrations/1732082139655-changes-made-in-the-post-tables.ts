import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesMadeInThePostTables1732082139655 implements MigrationInterface {
    name = 'ChangesMadeInThePostTables1732082139655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset" ALTER COLUMN "modified_By" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "asset" ALTER COLUMN "modified_date" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "content" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "hashtags" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "modified_By" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "modified_date" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post-job-log" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post-job-log" ALTER COLUMN "retry_count" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post-job-log" ALTER COLUMN "error_message" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post-job-log" ALTER COLUMN "modified_By" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post-job-log" ALTER COLUMN "modified_date" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_task" ALTER COLUMN "task_type" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_task" ALTER COLUMN "scheduled_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_task" ALTER COLUMN "rejection_reason" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_task" ALTER COLUMN "modified_By" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_task" ALTER COLUMN "modified_date" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_task" ALTER COLUMN "modified_date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_task" ALTER COLUMN "modified_By" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_task" ALTER COLUMN "rejection_reason" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_task" ALTER COLUMN "scheduled_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_task" ALTER COLUMN "task_type" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post-job-log" ALTER COLUMN "modified_date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post-job-log" ALTER COLUMN "modified_By" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post-job-log" ALTER COLUMN "error_message" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post-job-log" ALTER COLUMN "retry_count" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post-job-log" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "modified_date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "modified_By" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "hashtags" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "content" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "asset" ALTER COLUMN "modified_date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "asset" ALTER COLUMN "modified_By" SET NOT NULL`);
    }

}
