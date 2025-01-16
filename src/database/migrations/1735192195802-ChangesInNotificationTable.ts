import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInNotificationTable1735192195802 implements MigrationInterface {
    name = 'ChangesInNotificationTable1735192195802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "isRead"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "is_read" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "modified_at"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "modified_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "modified_at"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "modified_at" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "created_at" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "is_read"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "isRead" boolean NOT NULL DEFAULT false`);
    }

}
