import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesMadeInTheSubscriptionTable1735553467601 implements MigrationInterface {
    name = 'ChangesMadeInTheSubscriptionTable1735553467601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP CONSTRAINT "FK_53eddbcea66716f42da120d4416"`);
        await queryRunner.query(`ALTER TABLE "user_credit" DROP CONSTRAINT "FK_6b039ccd262dc631904712f6132"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "PK_a87248d73155605cf782be9ee5e"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_credit" DROP CONSTRAINT "PK_d4725a805df3467b388a7fa05ac"`);
        await queryRunner.query(`ALTER TABLE "user_credit" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD CONSTRAINT "PK_d4725a805df3467b388a7fa05ac" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_credit" DROP COLUMN "subscription_id"`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD "subscription_id" character varying`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP CONSTRAINT "PK_ec4e57f4138e339fb111948a16f"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD CONSTRAINT "PK_ec4e57f4138e339fb111948a16f" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP COLUMN "subscription_id"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD "subscription_id" character varying`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD CONSTRAINT "FK_6b039ccd262dc631904712f6132" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD CONSTRAINT "FK_53eddbcea66716f42da120d4416" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP CONSTRAINT "FK_53eddbcea66716f42da120d4416"`);
        await queryRunner.query(`ALTER TABLE "user_credit" DROP CONSTRAINT "FK_6b039ccd262dc631904712f6132"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP COLUMN "subscription_id"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD "subscription_id" integer`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP CONSTRAINT "PK_ec4e57f4138e339fb111948a16f"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD CONSTRAINT "PK_ec4e57f4138e339fb111948a16f" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_credit" DROP COLUMN "subscription_id"`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD "subscription_id" integer`);
        await queryRunner.query(`ALTER TABLE "user_credit" DROP CONSTRAINT "PK_d4725a805df3467b388a7fa05ac"`);
        await queryRunner.query(`ALTER TABLE "user_credit" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD CONSTRAINT "PK_d4725a805df3467b388a7fa05ac" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "PK_a87248d73155605cf782be9ee5e"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD CONSTRAINT "FK_6b039ccd262dc631904712f6132" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD CONSTRAINT "FK_53eddbcea66716f42da120d4416" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
