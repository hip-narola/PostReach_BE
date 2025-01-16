import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAnswerTable1731392005949 implements MigrationInterface {
    name = 'CreateUserAnswerTable1731392005949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_answer" ("id" SERIAL NOT NULL, "question_id" integer, "question_option_id" integer, "user_id" integer, "answer_text" character varying, "duration" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "REL_db0134f6a2c085be5a14274dcf" UNIQUE ("question_option_id"), CONSTRAINT "PK_37b32f666e59572775b1b020fb5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_09c48ec03d5ae846ea0a97618e0" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_db0134f6a2c085be5a14274dcfe" FOREIGN KEY ("question_option_id") REFERENCES "question_option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD CONSTRAINT "FK_9f4693fc1508a5e7bc3639cd9a9" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_9f4693fc1508a5e7bc3639cd9a9"`);
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_db0134f6a2c085be5a14274dcfe"`);
        await queryRunner.query(`ALTER TABLE "user_answer" DROP CONSTRAINT "FK_09c48ec03d5ae846ea0a97618e0"`);
        await queryRunner.query(`DROP TABLE "user_answer"`);
    }

}
