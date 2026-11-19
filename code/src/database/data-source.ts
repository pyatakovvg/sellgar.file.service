import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { FileDatabaseOptions } from './file-database.options';

if (existsSync('.env')) process.loadEnvFile('.env');
export default new DataSource(FileDatabaseOptions.create(process.env));
