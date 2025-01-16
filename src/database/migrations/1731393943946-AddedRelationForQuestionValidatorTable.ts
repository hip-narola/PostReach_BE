import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedRelationForQuestionValidatorTable1731393943946 implements MigrationInterface {
    name = 'AddedRelationForQuestionValidatorTable1731393943946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" ADD "question_validator_id" integer`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "UQ_810cf686ad7af9e868a8effa399" UNIQUE ("question_validator_id")`);
        await queryRunner.query(`ALTER TABLE "question" ADD "is_required" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "FK_810cf686ad7af9e868a8effa399" FOREIGN KEY ("question_validator_id") REFERENCES "question_validator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_810cf686ad7af9e868a8effa399"`);
        await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "is_required"`);
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "UQ_810cf686ad7af9e868a8effa399"`);
        await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "question_validator_id"`);
    }

}
