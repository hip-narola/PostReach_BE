import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedFacebookProfileInTheSocialMediaAccountTable1731499538571 implements MigrationInterface {
    name = 'AddedFacebookProfileInTheSocialMediaAccountTable1731499538571'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ADD "instagram_Profile" character varying`);
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ADD "facebook_Profile" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" DROP COLUMN "facebook_Profile"`);
        await queryRunner.query(`ALTER TABLE "social_media_accounts" DROP COLUMN "instagram_Profile"`);
    }

}
