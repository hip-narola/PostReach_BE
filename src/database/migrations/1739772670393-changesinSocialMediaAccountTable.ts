import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesinSocialMediaAccountTable1739772670393 implements MigrationInterface {
    name = 'ChangesinSocialMediaAccountTable1739772670393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ALTER COLUMN "updated_at" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ALTER COLUMN "updated_at" SET DEFAULT now()`);
    }

}
