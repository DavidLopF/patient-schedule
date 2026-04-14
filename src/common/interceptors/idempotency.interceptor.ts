import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from, of, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IdempotencyService } from '../services/idempotency.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotencyService: IdempotencyService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<import('express').Request>();

    const idempotencyKey = request.headers['idempotency-key'] as
      | string
      | undefined;

    if (!idempotencyKey) {
      return next.handle();
    }

    // Convert async Redis lookup to Observable pipeline
    return from(this.idempotencyService.get(idempotencyKey)).pipe(
      switchMap((existing) => {
        if (existing) {
          // Cache HIT — return stored response immediately
          return of(existing);
        }

        // Cache MISS — execute handler and cache the result
        return next.handle().pipe(
          tap((data: unknown) => {
            // Fire-and-forget: store response, don't await
            void this.idempotencyService.set(idempotencyKey, data);
          }),
        );
      }),
    );
  }
}
