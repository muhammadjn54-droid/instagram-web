import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errors: string[] = ['Internal server error'];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errors = [exceptionResponse];
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const body = exceptionResponse as Record<string, unknown>;
        if (Array.isArray(body.message)) {
          errors = body.message.map((m) => String(m));
        } else if (typeof body.message === 'string') {
          errors = [body.message];
        } else if (Array.isArray(body.errors)) {
          errors = body.errors.map((e) => String(e));
        } else {
          errors = [exception.message];
        }
      }
    } else if (exception instanceof Error) {
      errors = [exception.message];
    }

    response.status(status).json({
      statusCode: status,
      data: null,
      errors,
    });
  }
}
