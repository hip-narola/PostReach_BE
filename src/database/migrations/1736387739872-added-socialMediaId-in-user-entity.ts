import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedSocialMediaIdInUserEntity1736387739872 implements MigrationInterface {
    name = 'AddedSocialMediaIdInUserEntity1736387739872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "socialMediaId" character varying`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "socialMediaId"`);
    }

}
