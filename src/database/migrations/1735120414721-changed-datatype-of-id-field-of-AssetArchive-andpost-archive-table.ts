import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedDatatypeOfIdFieldOfAssetArchiveAndpostArchiveTable1735120414721 implements MigrationInterface {
    name = 'ChangedDatatypeOfIdFieldOfAssetArchiveAndpostArchiveTable1735120414721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset_archive" DROP CONSTRAINT "FK_7c954caf2b708117e50673bbbcc"`);
        await queryRunner.query(`ALTER TABLE "post_archive" DROP CONSTRAINT "PK_d6638bc47770e6bf8ca5fff4002"`);
        await queryRunner.query(`ALTER TABLE "post_archive" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "post_archive" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_archive" ADD CONSTRAINT "PK_d6638bc47770e6bf8ca5fff4002" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "asset_archive" DROP CONSTRAINT "PK_1f956c46399f8f6822eeb1c1ea6"`);
        await queryRunner.query(`ALTER TABLE "asset_archive" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "asset_archive" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "asset_archive" ADD CONSTRAINT "PK_1f956c46399f8f6822eeb1c1ea6" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "asset_archive" DROP COLUMN "Post_archive_id"`);
        await queryRunner.query(`ALTER TABLE "asset_archive" ADD "Post_archive_id" character varying`);
        await queryRunner.query(`ALTER TABLE "asset_archive" ADD CONSTRAINT "FK_7c954caf2b708117e50673bbbcc" FOREIGN KEY ("Post_archive_id") REFERENCES "post_archive"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset_archive" DROP CONSTRAINT "FK_7c954caf2b708117e50673bbbcc"`);
        await queryRunner.query(`ALTER TABLE "asset_archive" DROP COLUMN "Post_archive_id"`);
        await queryRunner.query(`ALTER TABLE "asset_archive" ADD "Post_archive_id" integer`);
        await queryRunner.query(`ALTER TABLE "asset_archive" DROP CONSTRAINT "PK_1f956c46399f8f6822eeb1c1ea6"`);
        await queryRunner.query(`ALTER TABLE "asset_archive" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "asset_archive" ADD "id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "asset_archive" ADD CONSTRAINT "PK_1f956c46399f8f6822eeb1c1ea6" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "post_archive" DROP CONSTRAINT "PK_d6638bc47770e6bf8ca5fff4002"`);
        await queryRunner.query(`ALTER TABLE "post_archive" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "post_archive" ADD "id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_archive" ADD CONSTRAINT "PK_d6638bc47770e6bf8ca5fff4002" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "asset_archive" ADD CONSTRAINT "FK_7c954caf2b708117e50673bbbcc" FOREIGN KEY ("Post_archive_id") REFERENCES "post_archive"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
