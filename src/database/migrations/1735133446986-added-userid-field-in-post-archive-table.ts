import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUseridFieldInPostArchiveTable1735133446986 implements MigrationInterface {
    name = 'AddedUseridFieldInPostArchiveTable1735133446986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_archive" DROP CONSTRAINT "FK_79a70a3bc0344afde33276dfbdf"`);
        await queryRunner.query(`ALTER TABLE "post_archive" RENAME COLUMN "post_task_id" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "post_archive" ADD CONSTRAINT "FK_4ce15281e06873a5278ee2c498f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_archive" DROP CONSTRAINT "FK_4ce15281e06873a5278ee2c498f"`);
        await queryRunner.query(`ALTER TABLE "post_archive" RENAME COLUMN "user_id" TO "post_task_id"`);
        await queryRunner.query(`ALTER TABLE "post_archive" ADD CONSTRAINT "FK_79a70a3bc0344afde33276dfbdf" FOREIGN KEY ("post_task_id") REFERENCES "post_task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
