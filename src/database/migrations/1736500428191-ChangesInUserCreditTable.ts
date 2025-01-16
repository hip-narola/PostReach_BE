import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInUserCreditTable1736500428191 implements MigrationInterface {
    name = 'ChangesInUserCreditTable1736500428191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ADD "cancel_Date" TIMESTAMP DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" DROP COLUMN "cancel_Date"`);
    }

}
