import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesMadeInSocialMediaAccountTable1733309830922 implements MigrationInterface {
    name = 'ChangesMadeInSocialMediaAccountTable1733309830922'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_insights" DROP CONSTRAINT "FK_a65e0e496406ffb6cd946ada6eb"`);
        await queryRunner.query(`ALTER TABLE "social_media_insights" DROP COLUMN "platform"`);
        await queryRunner.query(`ALTER TABLE "social_media_insights" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "social_media_insights" ADD "socia_media_account_id" integer`);
        await queryRunner.query(`ALTER TABLE "social_media_insights" ADD CONSTRAINT "FK_7465076fe3c95a1c59eaaa7c681" FOREIGN KEY ("socia_media_account_id") REFERENCES "social_media_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_insights" DROP CONSTRAINT "FK_7465076fe3c95a1c59eaaa7c681"`);
        await queryRunner.query(`ALTER TABLE "social_media_insights" DROP COLUMN "socia_media_account_id"`);
        await queryRunner.query(`ALTER TABLE "social_media_insights" ADD "user_id" integer`);
        await queryRunner.query(`ALTER TABLE "social_media_insights" ADD "platform" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "social_media_insights" ADD CONSTRAINT "FK_a65e0e496406ffb6cd946ada6eb" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
