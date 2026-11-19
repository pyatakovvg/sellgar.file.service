import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';
import { FileModel } from '../api/v1/file/file.model';
import { FolderModel } from '../api/v1/folder/folder.model';

export class FileDatabaseOptions {
  static create(env: NodeJS.ProcessEnv): DataSourceOptions {
    return {
      type: 'postgres',
      host: env.DATABASE_HOST,
      port: Number(env.DATABASE_PORT ?? 5432),
      username: env.DATABASE_USERNAME,
      password: env.DATABASE_PASSWORD,
      database: env.DATABASE_DATABASE_NAME,
      entities: [FileModel, FolderModel],
      migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
      synchronize: false,
      migrationsRun: false,
      dropSchema: false,
    };
  }
}
