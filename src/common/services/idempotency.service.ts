import { Injectable, Logger } from '@nestjs/common';

// In-memory idempotency store (use Redis in production)
// For production: inject Redis client and store with TTL
@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly store = new Map<string, unknown>();
  private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  async get(key: string): Promise<unknown | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    this.logger.debug(`Idempotency cache HIT for key: ${key}`);
    return entry;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value);
    this.logger.debug(`Idempotency cache SET for key: ${key}`);

    // Auto-cleanup after TTL
    setTimeout(() => {
      this.store.delete(key);
    }, this.TTL_MS);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}
