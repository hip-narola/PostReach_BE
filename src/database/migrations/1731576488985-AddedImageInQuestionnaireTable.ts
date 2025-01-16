import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedImageInQuestionnaireTable1731576488985 implements MigrationInterface {
    name = 'AddedImageInQuestionnaireTable1731576488985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questionnaire" ADD "image_name" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questionnaire" DROP COLUMN "image_name"`);
    }

}
