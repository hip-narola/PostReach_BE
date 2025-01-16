import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Logger } from 'src/services/logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: Logger) { }

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;
        message =
            exception instanceof HttpException
                ? (exception.getResponse() as any).message || 'An error occurred'
                : 'Internal server error';

        if (exception instanceof Error) {
            if (exception.name === 'UserNotConfirmedException') {
                message = "User is not confirmed.";
                status = HttpStatus.BAD_REQUEST;
            } else if (exception.name === 'NotAuthorizedException') {
                message = "Incorrect username or password.";
                status = HttpStatus.OK;
            } else if (exception.name === "UsernameExistsException") {
                message = "User already exists";
                status = HttpStatus.OK;
            } else if (exception.name === "ExpiredCodeException") {
                message = "OTP is invalid. Please send again";
                status = HttpStatus.BAD_REQUEST;
            } else if (exception.name === "InvalidPasswordException") {
                message = exception.message;
                status = HttpStatus.OK;
            }
            else if (exception.name === "CodeMismatchException") {
                message = "OTP is invalid. Please send again";
                status = HttpStatus.BAD_REQUEST;
            }

        }
        const errorPath = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
        const trace = exception instanceof Error ? exception.stack : '';
        const timestamp = new Date().toISOString();
        const errorObject = exception instanceof Error ? exception : { message, stack: trace };
        const logMessage = `| Path: ${errorPath} | ErrorMessage: ${message} | Status: ${status} | Exception: ${JSON.stringify(errorObject, null, 2)}`;
        this.logger.error(logMessage, trace, errorPath);
        response.status(status).json({
            StatusCode: status,
            Message: message,
            IsSuccess: false,
            Data: null,
        });
    }
}
