import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateQuestionAndAnswerTable1731318539187 implements MigrationInterface {
    name = 'CreateQuestionAndAnswerTable1731318539187'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "questionnaire" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_e8232a11eaabac903636eb7e71e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question_option" ("id" SERIAL NOT NULL, "question_id" integer, "name" text NOT NULL, "sub_question_id" integer, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_64f8e42188891f2b0610017c8f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question" ("id" SERIAL NOT NULL, "question" character varying, "question_type" character varying, "questionnaire_id" bigint, "control_label" character varying, "control_placeholder" character varying, "question_description" text, "question_order" integer, "step_id" bigint NOT NULL, "reference_id" bigint, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "onboarding_user_lead" DROP COLUMN "questionId"`);
        await queryRunner.query(`ALTER TABLE "onboarding_user_lead" ADD CONSTRAINT "FK_3087dceb281fbe2bc6bb2660369" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "onboarding_user_lead" DROP CONSTRAINT "FK_3087dceb281fbe2bc6bb2660369"`);
        await queryRunner.query(`ALTER TABLE "onboarding_user_lead" ADD "questionId" integer NOT NULL`);
        await queryRunner.query(`DROP TABLE "question"`);
        await queryRunner.query(`DROP TABLE "question_option"`);
        await queryRunner.query(`DROP TABLE "questionnaire"`);
    }

}
