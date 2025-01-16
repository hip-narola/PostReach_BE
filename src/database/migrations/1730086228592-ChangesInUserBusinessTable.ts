import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInUserBusinessTable1730086228592 implements MigrationInterface {
    name = 'ChangesInUserBusinessTable1730086228592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "primary_goal"`);
        await queryRunner.query(`DROP TYPE "public"."user_business_primary_goal_enum"`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "website" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "use" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "primary_goals" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "target_audience" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "voice_content" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "focus" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "industries"`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "industries" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "industries"`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "industries" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "focus"`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "voice_content"`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "target_audience"`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "primary_goals"`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "use"`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "website"`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "description" text NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."user_business_primary_goal_enum" AS ENUM('Increase brand awareness', 'Generate leads or sales', 'Drive traffic to the website')`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "primary_goal" "public"."user_business_primary_goal_enum" NOT NULL`);
    }

}
