import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedColumnsInQuestionValidatorTable1731408460033 implements MigrationInterface {
    name = 'AddedColumnsInQuestionValidatorTable1731408460033'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" DROP COLUMN "instagram_id"`);
        await queryRunner.query(`ALTER TABLE "question_validator" ADD "name" character varying`);
        await queryRunner.query(`ALTER TABLE "question_validator" ADD "message" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_validator" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "question_validator" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ADD "instagram_id" character varying`);
    }

}
