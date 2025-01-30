import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangesInuserBusinessTable1738149603563 implements MigrationInterface {
    name = 'ChangesInuserBusinessTable1738149603563'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_business" ALTER COLUMN "brand_name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_business" ALTER COLUMN "brand_name" SET NOT NULL`);
    }

}
