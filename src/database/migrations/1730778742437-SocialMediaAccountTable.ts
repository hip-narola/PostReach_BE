import { MigrationInterface, QueryRunner } from "typeorm";

export class SocialMediaAccountTable1730778742437 implements MigrationInterface {
    name = 'SocialMediaAccountTable1730778742437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "social_media_accounts" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "platform" character varying NOT NULL, "token_type" character varying, "encrypted_access_token" character varying, "encryption_key_id" character varying, "refresh_token" character varying, "expires_in" integer, "scope" character varying, "connected_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1d867fd935a03bb03d5d4c61a05" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ADD CONSTRAINT "FK_c699ca1c62cd9707420e4acab90" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" DROP CONSTRAINT "FK_c699ca1c62cd9707420e4acab90"`);
        await queryRunner.query(`DROP TABLE "social_media_accounts"`);
    }

}
