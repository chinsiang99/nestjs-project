import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserTable1714354381186 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                CREATE TABLE \`user\` (
                    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
                    \`email\` VARCHAR(255) UNIQUE NOT NULL,
                    \`password\` VARCHAR(255) NULL,
                    \`auth_strategy\` ENUM('system', 'google', 'facebook') NOT NULL,
                    \`role\` ENUM('admin', 'user') NOT NULL
                );
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE \`user\`;
        `);
  }
}
