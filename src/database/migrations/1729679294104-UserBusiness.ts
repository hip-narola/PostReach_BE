import { MigrationInterface, QueryRunner } from "typeorm";

export class UserBusiness1729679294104 implements MigrationInterface {
    name = 'UserBusiness1729679294104'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_business_primary_goal_enum" AS ENUM('Increase brand awareness', 'Generate leads or sales', 'Drive traffic to the website')`);
        await queryRunner.query(`CREATE TABLE "user_business" ("id" SERIAL NOT NULL, "brand_name" character varying NOT NULL, "industries" character varying NOT NULL, "primary_goal" "public"."user_business_primary_goal_enum" NOT NULL, "location" character varying NOT NULL, "description" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" integer, CONSTRAINT "REL_3355213a29545a4cc79a9197c5" UNIQUE ("user_id"), CONSTRAINT "PK_5a4bd96d9a519d4d20a21231b9f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD CONSTRAINT "FK_3355213a29545a4cc79a9197c5d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_business" DROP CONSTRAINT "FK_3355213a29545a4cc79a9197c5d"`);
        await queryRunner.query(`DROP TABLE "user_business"`);
        await queryRunner.query(`DROP TYPE "public"."user_business_primary_goal_enum"`);
    }

}
