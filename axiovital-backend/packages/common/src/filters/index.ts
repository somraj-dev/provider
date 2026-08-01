import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const obj = exceptionResponse as Record<string, unknown>;
        message = (obj.message as string) || exception.message;
        errorCode = (obj.error as string) || errorCode;
        details = obj.details || undefined;
        if (Array.isArray(obj.message)) {
          message = 'Validation failed';
          details = obj.message;
          errorCode = 'VALIDATION_ERROR';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      type: `https://axiovital.com/errors/${errorCode.toLowerCase().replace(/_/g, '-')}`,
      title: errorCode,
      status,
      detail: message,
      instance: request.url,
      timestamp: new Date().toISOString(),
      ...(details ? { errors: details } : {}),
    };

    this.logger.error(
      { ...errorResponse, method: request.method, path: request.url,
        stack: exception instanceof Error ? exception.stack : undefined },
      `${request.method} ${request.url} → ${status}`,
    );

    response.status(status).json(errorResponse);
  }
}
