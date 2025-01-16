import { Catch } from '@nestjs/common';
import { ExceptionFilter } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Check if response is already sent
    if (response.headersSent) {
      return;
    }

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      message:
        exception instanceof Error
          ? exception.message
          : 'Internal server error',
    };

    // Log detailed error information
    console.error('Exception occurred:', {
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      method: request.method,
      statusCode: httpStatus,
      message: exception instanceof Error ? exception.message : 'Internal server error',
      stack: exception instanceof Error ? exception.stack : undefined,
      body: request.body,
      query: request.query,
      params: request.params,
      headers: request.headers,
      exception: exception
    });

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
