import { MigrationInterface, QueryRunner } from "typeorm";

export class PostRelatedTables1731930400329 implements MigrationInterface {
    name = 'PostRelatedTables1731930400329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "asset" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "type" character varying NOT NULL, "created_By" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "modified_By" integer NOT NULL, "modified_date" TIMESTAMP NOT NULL DEFAULT now(), "post_id" integer, CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "external_platform_id" integer NOT NULL, "content" character varying NOT NULL, "hashtags" character varying NOT NULL, "created_By" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "modified_By" integer NOT NULL, "modified_date" TIMESTAMP NOT NULL DEFAULT now(), "post_task_id" integer, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post-job-log" ("id" SERIAL NOT NULL, "job_id" integer NOT NULL, "status" character varying NOT NULL, "retry_count" integer NOT NULL, "error_message" character varying NOT NULL, "created_By" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "modified_By" integer NOT NULL, "modified_date" TIMESTAMP NOT NULL DEFAULT now(), "post_task_id" integer, CONSTRAINT "PK_7ebf83864cbecbc7f36d6b7ec8d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_task" ("id" SERIAL NOT NULL, "task_type" character varying NOT NULL, "scheduled_at" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying NOT NULL, "rejection_reason" character varying NOT NULL, "created_By" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "modified_By" integer NOT NULL, "modified_date" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, "social_media_account_id" integer, CONSTRAINT "PK_40afa294343dad06321ac5a4a13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "asset" ADD CONSTRAINT "FK_c2575c28bd6bd0629382bf71977" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_e87c840dcf174f302e7b3f7b689" FOREIGN KEY ("post_task_id") REFERENCES "post_task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post-job-log" ADD CONSTRAINT "FK_3a7a9216dd2b9166730b00fe35a" FOREIGN KEY ("post_task_id") REFERENCES "post_task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_task" ADD CONSTRAINT "FK_ed65033d50bfac31cc71436b688" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_task" ADD CONSTRAINT "FK_d8d2fde445d0b2a7e8c39de3e47" FOREIGN KEY ("social_media_account_id") REFERENCES "social_media_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_task" DROP CONSTRAINT "FK_d8d2fde445d0b2a7e8c39de3e47"`);
        await queryRunner.query(`ALTER TABLE "post_task" DROP CONSTRAINT "FK_ed65033d50bfac31cc71436b688"`);
        await queryRunner.query(`ALTER TABLE "post-job-log" DROP CONSTRAINT "FK_3a7a9216dd2b9166730b00fe35a"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_e87c840dcf174f302e7b3f7b689"`);
        await queryRunner.query(`ALTER TABLE "asset" DROP CONSTRAINT "FK_c2575c28bd6bd0629382bf71977"`);
        await queryRunner.query(`DROP TABLE "post_task"`);
        await queryRunner.query(`DROP TABLE "post-job-log"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "asset"`);
    }

}
