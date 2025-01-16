import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateQuestionValidatorTable1731392653981 implements MigrationInterface {
    name = 'CreateQuestionValidatorTable1731392653981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "question_validator" ("id" SERIAL NOT NULL, "regex" character varying, "min" bigint, "max" bigint, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_95659cde2b67628c89ae0ba435a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "question_validator"`);
    }

}
