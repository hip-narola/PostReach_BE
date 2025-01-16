import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInSocialMediaAccountTable1733478104562 implements MigrationInterface {
    name = 'ChangesInSocialMediaAccountTable1733478104562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ADD "social_media_user_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" DROP COLUMN "social_media_user_id"`);
    }

}
