import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IdempotencyService } from '../services/idempotency.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotencyService: IdempotencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<import('express').Request>();
    const idempotencyKey = request.headers['idempotency-key'] as
      | string
      | undefined;

    if (!idempotencyKey) {
      return next.handle();
    }

    const existing = this.idempotencyService.get(idempotencyKey);
    if (existing) {
      return of(existing);
    }

    return next.handle().pipe(
      tap((data: unknown) => {
        this.idempotencyService.set(idempotencyKey, data);
      }),
    );
  }
}
