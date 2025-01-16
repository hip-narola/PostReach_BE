import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInUserAndUserBusinessTable1730179883390 implements MigrationInterface {
    name = 'ChangesInUserAndUserBusinessTable1730179883390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_business" ADD "image_url" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "profilePictureUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profilePictureUrl"`);
        await queryRunner.query(`ALTER TABLE "user_business" DROP COLUMN "image_url"`);
    }

}
