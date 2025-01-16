import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedIsDisConnectFieldInSocialMediaAccount1734957783610 implements MigrationInterface {
    name = 'AddedIsDisConnectFieldInSocialMediaAccount1734957783610'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" ADD "isDisconnect" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_media_accounts" DROP COLUMN "isDisconnect"`);
    }

}
