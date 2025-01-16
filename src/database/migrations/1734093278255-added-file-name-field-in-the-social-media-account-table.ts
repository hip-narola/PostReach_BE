import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedFileNameFieldInTheSocialMediaAccountTable1734093278255 implements MigrationInterface {
    name = 'AddedFileNameFieldInTheSocialMediaAccountTable1734093278255'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ADD "file_name" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" DROP COLUMN "file_name"`);
    }

}
