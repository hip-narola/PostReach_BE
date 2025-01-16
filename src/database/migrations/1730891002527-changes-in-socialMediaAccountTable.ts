import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInSocialMediaAccountTable1730891002527 implements MigrationInterface {
    name = 'ChangesInSocialMediaAccountTable1730891002527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ADD "page_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" DROP COLUMN "page_id"`);
    }

}
