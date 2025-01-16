import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedInUserBusinessTable1731554489084 implements MigrationInterface {
    name = 'ChangedInUserBusinessTable1731554489084'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "primary_goals"`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "target_audience"`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "voice_content"`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "focus"`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "industries"`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "overview" text`);
        await queryRunner.query(`ALTER TABLE "user_business" ALTER COLUMN "website" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" ALTER COLUMN "use" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" ALTER COLUMN "location" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_business" ALTER COLUMN "location" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" ALTER COLUMN "use" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" ALTER COLUMN "website" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "overview"`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "industries" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "focus" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "voice_content" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "target_audience" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_business" ADD "primary_goals" text NOT NULL`);
    }

}
