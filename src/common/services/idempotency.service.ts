import { Injectable, Logger } from '@nestjs/common';

// In-memory idempotency store (use Redis in production)
// For production: inject Redis client and store with TTL
@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly store = new Map<string, unknown>();
  private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  get(key: string): unknown {
    const entry = this.store.get(key);
    if (entry === undefined) return null;
    this.logger.debug(`Idempotency cache HIT for key: ${key}`);
    return entry;
  }

  set(key: string, value: unknown): void {
    this.store.set(key, value);
    this.logger.debug(`Idempotency cache SET for key: ${key}`);

    // Auto-cleanup after TTL
    setTimeout(() => {
      this.store.delete(key);
    }, this.TTL_MS);
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}
