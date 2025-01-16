import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedFacebookProfileAccessTokenInSocialMEdiaAccount1734950576857 implements MigrationInterface {
    name = 'AddedFacebookProfileAccessTokenInSocialMEdiaAccount1734950576857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ADD "facebook_Profile_access_token" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" DROP COLUMN "facebook_Profile_access_token"`);
    }

}
