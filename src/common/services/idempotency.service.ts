import { Injectable, Inject, Logger } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

const TTL_SECONDS = 24 * 60 * 60; // 24 hours
const KEY_PREFIX = 'idempotency:';

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get(key: string): Promise<unknown> {
    try {
      const raw = await this.redis.get(`${KEY_PREFIX}${key}`);
      if (!raw) return null;

      this.logger.debug(`Cache HIT for idempotency key: ${key}`);
      return JSON.parse(raw) as unknown;
    } catch (err) {
      this.logger.warn(
        `Redis GET failed for key ${key}: ${(err as Error).message}`,
      );
      return null; // fail-open: let request proceed normally
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    try {
      await this.redis.setex(
        `${KEY_PREFIX}${key}`,
        TTL_SECONDS,
        JSON.stringify(value),
      );
      this.logger.debug(`Cache SET for idempotency key: ${key} (TTL: 24h)`);
    } catch (err) {
      this.logger.warn(
        `Redis SET failed for key ${key}: ${(err as Error).message}`,
      );
      // fail-open: response already sent, just log
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(`${KEY_PREFIX}${key}`);
    } catch (err) {
      this.logger.warn(
        `Redis DEL failed for key ${key}: ${(err as Error).message}`,
      );
    }
  }
}
