import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedFieldsInThePostTable1731999825759 implements MigrationInterface {
    name = 'AddedFieldsInThePostTable1731999825759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ADD "no_of_likes" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "post" ADD "no_of_comments" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "post" ADD "no_of_views" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "no_of_views"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "no_of_comments"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "no_of_likes"`);
    }

}
