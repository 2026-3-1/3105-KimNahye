import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isCompiled = __filename.endsWith('.js');

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [isCompiled ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
  migrations: [isCompiled ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  migrationsTransactionMode: 'each',
});
