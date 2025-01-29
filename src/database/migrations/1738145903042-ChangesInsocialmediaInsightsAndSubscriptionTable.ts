import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInsocialmediaInsightsAndSubscriptionTable1738145903042 implements MigrationInterface {
    name = 'ChangesInsocialmediaInsightsAndSubscriptionTable1738145903042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" SET DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "user_credit" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD "status" character varying DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD "status" character varying DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE "social_media_insights" DROP COLUMN "engagements"`);
        await queryRunner.query(`ALTER TABLE "social_media_insights" ADD "engagements" numeric(10,2) DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_insights" DROP COLUMN "engagements"`);
        await queryRunner.query(`ALTER TABLE "social_media_insights" ADD "engagements" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD "status" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_credit" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD "status" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "last_trigger_date" DROP DEFAULT`);
    }

}
