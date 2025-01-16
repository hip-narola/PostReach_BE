import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedRelationForQuestionValidatorTable1731394763900 implements MigrationInterface {
    name = 'ChangedRelationForQuestionValidatorTable1731394763900'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_810cf686ad7af9e868a8effa399"`);
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "UQ_810cf686ad7af9e868a8effa399"`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "FK_810cf686ad7af9e868a8effa399" FOREIGN KEY ("question_validator_id") REFERENCES "question_validator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_810cf686ad7af9e868a8effa399"`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "UQ_810cf686ad7af9e868a8effa399" UNIQUE ("question_validator_id")`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "FK_810cf686ad7af9e868a8effa399" FOREIGN KEY ("question_validator_id") REFERENCES "question_validator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
