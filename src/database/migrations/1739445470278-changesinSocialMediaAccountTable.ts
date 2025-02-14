import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesinSocialMediaAccountTable1739445470278 implements MigrationInterface {
    name = 'ChangesinSocialMediaAccountTable1739445470278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ALTER COLUMN "updated_at" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ALTER COLUMN "updated_at" SET NOT NULL`);
    }

}
