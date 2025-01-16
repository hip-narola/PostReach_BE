import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedPostArchiveAndAssetArchiveTable1735112188355 implements MigrationInterface {
    name = 'CreatedPostArchiveAndAssetArchiveTable1735112188355'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post_archive" ("id" integer NOT NULL, "external_platform_id" character varying, "no_of_likes" integer NOT NULL DEFAULT '0', "no_of_comments" integer NOT NULL DEFAULT '0', "no_of_views" integer NOT NULL DEFAULT '0', "content" character varying, "hashtags" character varying, "created_By" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "modified_By" integer, "modified_date" TIMESTAMP DEFAULT now(), "post_task_id" integer, CONSTRAINT "PK_d6638bc47770e6bf8ca5fff4002" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "asset_archive" ("id" integer NOT NULL, "url" character varying NOT NULL, "type" character varying NOT NULL, "created_By" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "modified_By" integer, "modified_date" TIMESTAMP DEFAULT now(), "Post_archive_id" integer, CONSTRAINT "PK_1f956c46399f8f6822eeb1c1ea6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "post_archive" ADD CONSTRAINT "FK_79a70a3bc0344afde33276dfbdf" FOREIGN KEY ("post_task_id") REFERENCES "post_task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "asset_archive" ADD CONSTRAINT "FK_7c954caf2b708117e50673bbbcc" FOREIGN KEY ("Post_archive_id") REFERENCES "post_archive"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "asset_archive" DROP CONSTRAINT "FK_7c954caf2b708117e50673bbbcc"`);
        await queryRunner.query(`ALTER TABLE "post_archive" DROP CONSTRAINT "FK_79a70a3bc0344afde33276dfbdf"`);
        await queryRunner.query(`DROP TABLE "asset_archive"`);
        await queryRunner.query(`DROP TABLE "post_archive"`);
    }

}
