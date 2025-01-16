import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedRelationForUserAnswerTable1731471287850 implements MigrationInterface {
    name = 'ChangedRelationForUserAnswerTable1731471287850'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_db0134f6a2c085be5a14274dcfe"`);
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "REL_db0134f6a2c085be5a14274dcf"`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_db0134f6a2c085be5a14274dcfe" FOREIGN KEY ("question_option_id") REFERENCES "question_option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_db0134f6a2c085be5a14274dcfe"`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "REL_db0134f6a2c085be5a14274dcf" UNIQUE ("question_option_id")`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_db0134f6a2c085be5a14274dcfe" FOREIGN KEY ("question_option_id") REFERENCES "question_option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
