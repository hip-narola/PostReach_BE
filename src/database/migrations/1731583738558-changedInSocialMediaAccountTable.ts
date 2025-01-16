import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedInSocialMediaAccountTable1731583738558 implements MigrationInterface {
    name = 'ChangedInSocialMediaAccountTable1731583738558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ADD "name" character varying`);
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ADD "user_name" character varying`);
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ADD "user_profile" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" DROP COLUMN "user_profile"`);
        await queryRunner.query(`ALTER TABLE "social_media_accounts" DROP COLUMN "user_name"`);
        await queryRunner.query(`ALTER TABLE "social_media_accounts" DROP COLUMN "name"`);
    }

}
