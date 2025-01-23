import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInsocialmediaInsightsTable1737633960196 implements MigrationInterface {
    name = 'ChangesInsocialmediaInsightsTable1737633960196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "social_media_insights" ALTER COLUMN "updated_at" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_insights" ALTER COLUMN "updated_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" DROP DEFAULT`);
    }

}
