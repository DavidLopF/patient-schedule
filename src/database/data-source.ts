import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load .env manually — this file runs outside of NestJS context (TypeORM CLI)
dotenv.config();

const toBoolean = (value?: string): boolean =>
  ['true', '1', 'yes', 'on'].includes((value ?? '').toLowerCase());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const sslEnabled = toBoolean(process.env.DB_SSL);
const rejectUnauthorized = toBoolean(
  process.env.DB_SSL_REJECT_UNAUTHORIZED ?? 'false',
);

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,

  // Entities — uses compiled JS in production, TS in dev via ts-node
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  // Migrations folder
  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  // NEVER true — migrations handle all schema changes
  synchronize: false,

  logging: process.env.NODE_ENV === 'development',
  ...(sslEnabled
    ? {
        ssl: { rejectUnauthorized },
      }
    : {}),
});
