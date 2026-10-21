import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Response } from 'express';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // Если ответ уже в формате ApiResponse, не оборачиваем повторно
        if (
          data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          'data' in data &&
          'errors' in data
        ) {
          return data;
        }

        return {
          statusCode: response.statusCode || 200,
          data: data !== undefined ? data : null,
          errors: null,
        };
      }),
    );
  }
}
