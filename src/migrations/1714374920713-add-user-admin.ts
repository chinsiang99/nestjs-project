import { MigrationInterface, QueryRunner } from 'typeorm';
import { hashSync } from 'bcryptjs';

export class AddUserAdmin1714374920713 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert admin user
    const password = 'password';
    const hashedPassword = hashSync(password, 10);
    await queryRunner.query(`
              INSERT IGNORE INTO \`user\` (\`email\`, \`password\`, \`auth_strategy\`, \`role\`)
              VALUES ('admin@gmail.com', '${hashedPassword}', 'system', 'admin')
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('');
  }
}
