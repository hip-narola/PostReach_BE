import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePostRetryTable1738327102360 implements MigrationInterface {
    name = 'CreatePostRetryTable1738327102360'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post-retry" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "credit_id" character varying NOT NULL, "pipeline_id" character varying NOT NULL, "status" character varying, "retry_count" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "modified_date" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_a13954ef305ea6a2468dd988d79" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "post-retry" ADD CONSTRAINT "FK_67d634e063f2d7badc2108ac814" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post-retry" ADD CONSTRAINT "FK_adc555f68b8c3832532b75d9a88" FOREIGN KEY ("credit_id") REFERENCES "user_credit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post-retry" DROP CONSTRAINT "FK_adc555f68b8c3832532b75d9a88"`);
        await queryRunner.query(`ALTER TABLE "post-retry" DROP CONSTRAINT "FK_67d634e063f2d7badc2108ac814"`);
        await queryRunner.query(`DROP TABLE "post-retry"`);
    }

}
