import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationTable1735127152562 implements MigrationInterface {
    name = 'CreateNotificationTable1735127152562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notification" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "content" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "created_at" character varying NOT NULL, "modified_at" character varying NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8"`);
        await queryRunner.query(`DROP TABLE "notification"`);
    }

}
