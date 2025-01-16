import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedSocialMediaInsights1733286451679 implements MigrationInterface {
    name = 'AddedSocialMediaInsights1733286451679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "social_media_insights" ("id" SERIAL NOT NULL, "platform" character varying NOT NULL, "impressions" integer NOT NULL, "newFollowers" integer NOT NULL, "engagements" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "PK_39f8343ba6db80f4cb179418d28" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "social_media_insights" ADD CONSTRAINT "FK_a65e0e496406ffb6cd946ada6eb" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_insights" DROP CONSTRAINT "FK_a65e0e496406ffb6cd946ada6eb"`);
        await queryRunner.query(`DROP TABLE "social_media_insights"`);
    }

}
