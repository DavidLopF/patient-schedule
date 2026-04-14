import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const toBoolean = (value?: string): boolean =>
  ['true', '1', 'yes', 'on'].includes((value ?? '').toLowerCase());

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required');
    }

    const sslEnabled = toBoolean(process.env.DB_SSL);
    const rejectUnauthorized = toBoolean(
      process.env.DB_SSL_REJECT_UNAUTHORIZED ?? 'false',
    );

    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],

      // ✅ synchronize: false en todos los ambientes.
      // El schema lo controlan EXCLUSIVAMENTE las migraciones.
      synchronize: false,

      // migrationsRun: true ejecuta migraciones pendientes al arrancar la app.
      // Conveniente en staging/prod via Docker. En dev puedes preferir correrlas
      // manualmente con `npm run migration:run` para tener más control.
      migrationsRun: process.env.NODE_ENV === 'production',

      logging: process.env.NODE_ENV === 'development',
      ...(sslEnabled
        ? {
            ssl: { rejectUnauthorized },
          }
        : {}),
    };
  },
);
