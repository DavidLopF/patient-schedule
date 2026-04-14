import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'hospital_db',
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
  }),
);
