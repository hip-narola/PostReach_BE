import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedSubscriptionTableUserCreditTableUserSubscriptionTable1735197936718 implements MigrationInterface {
    name = 'AddedSubscriptionTableUserCreditTableUserSubscriptionTable1735197936718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" SERIAL NOT NULL, "planName" character varying(255) NOT NULL, "planType" integer NOT NULL, "amount" integer NOT NULL, "creditAmount" integer NOT NULL, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_credit" ("id" SERIAL NOT NULL, "initial_credit_amount" integer NOT NULL, "current_credit_amount" integer NOT NULL, "start_Date" TIMESTAMP NOT NULL DEFAULT now(), "end_Date" TIMESTAMP NOT NULL DEFAULT now(), "status" integer NOT NULL, "user_id" integer, "subscription_id" integer, CONSTRAINT "PK_d4725a805df3467b388a7fa05ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_subscription" ("id" SERIAL NOT NULL, "stripe_subscription_id" character varying, "status" integer NOT NULL, "start_Date" TIMESTAMP NOT NULL DEFAULT now(), "end_Date" TIMESTAMP NOT NULL DEFAULT now(), "amount" integer NOT NULL, "currency" integer NOT NULL, "subscription_id" integer, "user_id" integer, CONSTRAINT "PK_ec4e57f4138e339fb111948a16f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD CONSTRAINT "FK_39962c9430d40aaa68ca3feb4f9" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_credit" ADD CONSTRAINT "FK_6b039ccd262dc631904712f6132" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD CONSTRAINT "FK_53eddbcea66716f42da120d4416" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ADD CONSTRAINT "FK_3c6b79d14e6539ddb486aab80f5" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP CONSTRAINT "FK_3c6b79d14e6539ddb486aab80f5"`);
        await queryRunner.query(`ALTER TABLE "user_subscription" DROP CONSTRAINT "FK_53eddbcea66716f42da120d4416"`);
        await queryRunner.query(`ALTER TABLE "user_credit" DROP CONSTRAINT "FK_6b039ccd262dc631904712f6132"`);
        await queryRunner.query(`ALTER TABLE "user_credit" DROP CONSTRAINT "FK_39962c9430d40aaa68ca3feb4f9"`);
        await queryRunner.query(`DROP TABLE "user_subscription"`);
        await queryRunner.query(`DROP TABLE "user_credit"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
    }

}
