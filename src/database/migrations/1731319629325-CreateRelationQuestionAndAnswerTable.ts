import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRelationQuestionAndAnswerTable1731319629325 implements MigrationInterface {
    name = 'CreateRelationQuestionAndAnswerTable1731319629325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "questionnaire_id"`);
        await queryRunner.query(`ALTER TABLE "question" ADD "questionnaire_id" integer`);
        await queryRunner.query(`ALTER TABLE "question_option" ADD CONSTRAINT "FK_747190c37a39feced5efcbb303f" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_option" ADD CONSTRAINT "FK_fda1f9ab98ef11b2b94304984be" FOREIGN KEY ("sub_question_id") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "FK_fa40da56981f3a6fe573e7dce19" FOREIGN KEY ("questionnaire_id") REFERENCES "questionnaire"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_fa40da56981f3a6fe573e7dce19"`);
        await queryRunner.query(`ALTER TABLE "question_option" DROP CONSTRAINT "FK_fda1f9ab98ef11b2b94304984be"`);
        await queryRunner.query(`ALTER TABLE "question_option" DROP CONSTRAINT "FK_747190c37a39feced5efcbb303f"`);
        await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "questionnaire_id"`);
        await queryRunner.query(`ALTER TABLE "question" ADD "questionnaire_id" bigint`);
    }

}
