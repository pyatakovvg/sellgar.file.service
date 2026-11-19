import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFileStorage1795104000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE folder (
      uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      parent_uuid uuid REFERENCES folder(uuid),
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await queryRunner.query('CREATE INDEX idx_folder_parent_uuid ON folder(parent_uuid)');
    await queryRunner.query(`CREATE TABLE file (
      uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      storage_key text NOT NULL,
      mime text NOT NULL,
      size integer NOT NULL,
      status text NOT NULL DEFAULT 'ready',
      expires_at timestamp,
      folder_uuid uuid REFERENCES folder(uuid),
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await queryRunner.query('CREATE INDEX idx_file_folder_uuid ON file(folder_uuid)');
    await queryRunner.query('CREATE UNIQUE INDEX uq_file_storage_key ON file(storage_key)');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE file');
    await queryRunner.query('DROP TABLE folder');
  }
}
