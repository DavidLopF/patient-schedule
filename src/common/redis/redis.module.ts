import { Global, Module, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

const retryStrategy = (logger: Logger) => (times: number) => {
  if (times > 3) {
    logger.error(`❌ Redis: no se pudo conectar después de ${times} intentos`);
    return null; // deja de reintentar — fail-open
  }
  const delay = Math.min(times * 200, 1000);
  logger.warn(`⏳ Redis: reintentando conexión (intento ${times}) en ${delay}ms`);
  return delay;
};

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<Redis> => {
        const logger = new Logger('RedisModule');
        const redisUrl = configService.get<string>('app.redisUrl');

        const options = {
          tls: redisUrl?.startsWith('rediss://') ? {} : undefined,
          retryStrategy: retryStrategy(logger),
          connectTimeout: 5000,
          // Sin lazyConnect — conecta eagerly al arrancar
        };

        const client = redisUrl
          ? new Redis(redisUrl, options)
          : new Redis({ host: 'localhost', port: 6379, ...options });

        client.on('connect', () =>
          logger.log(`✅ Redis conectado — ${redisUrl ?? 'localhost:6379'}`),
        );
        client.on('ready', () =>
          logger.log('🚀 Redis listo para recibir comandos'),
        );
        client.on('error', (err: Error) =>
          logger.error(`Redis error: ${err.message}`),
        );
        client.on('close', () => logger.warn('⚠️  Redis: conexión cerrada'));
        client.on('reconnecting', () =>
          logger.warn('🔄 Redis: reconectando...'),
        );

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor() {}

  async onApplicationShutdown() {
    // El cliente se cierra limpiamente al apagar el servicio
  }
}
