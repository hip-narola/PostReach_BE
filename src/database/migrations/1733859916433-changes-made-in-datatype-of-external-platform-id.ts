import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesMadeInDatatypeOfExternalPlatformId1733859916433 implements MigrationInterface {
    name = 'ChangesMadeInDatatypeOfExternalPlatformId1733859916433'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" DROP COLUMN "social_media_user_id"`);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "external_platform_id"`);
        await queryRunner.query(`ALTER TABLE "post" ADD "external_platform_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "external_platform_id"`);
        await queryRunner.query(`ALTER TABLE "post" ADD "external_platform_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ADD "social_media_user_id" character varying`);
    }

}
