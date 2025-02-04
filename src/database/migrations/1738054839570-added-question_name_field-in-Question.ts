import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedQuestionNameFieldInQuestion1738054839570 implements MigrationInterface {
    name = 'AddedQuestionNameFieldInQuestion1738054839570'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question" ADD "question_name" character varying`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "question_name"`);
    }

}
