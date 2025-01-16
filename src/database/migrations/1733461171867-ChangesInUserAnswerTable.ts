import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInUserAnswerTable1733461171867 implements MigrationInterface {
    name = 'ChangesInUserAnswerTable1733461171867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_answer" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "questionnaire" ADD "duration" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questionnaire" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "user_answer" ADD "duration" integer`);
    }

}
