import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedinNotificationTable1738561240471 implements MigrationInterface {
    name = 'ChangedinNotificationTable1738561240471'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "modified_at" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "modified_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_subscription" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_credit" ALTER COLUMN "status" DROP NOT NULL`);
    }

}
