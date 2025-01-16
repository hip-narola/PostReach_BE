import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInUserTable1729659925584 implements MigrationInterface {
    name = 'ChangesInUserTable1729659925584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "cognitoId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "profilePicture" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "phone" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "profilePicture" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "cognitoId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password" character varying NOT NULL`);
    }

}
