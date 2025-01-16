import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInUserCreditTable1736248678977 implements MigrationInterface {
    name = 'ChangesInUserCreditTable1736248678977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ADD "social_media_id" integer`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD CONSTRAINT "FK_660d09aa052d5df327cb7eb257d" FOREIGN KEY ("social_media_id") REFERENCES "social_media_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" DROP CONSTRAINT "FK_660d09aa052d5df327cb7eb257d"`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_credit" DROP COLUMN "social_media_id"`);
    }

}
