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

        // Default status and message
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (exception instanceof HttpException) {
            // Extract status and response message from HttpException
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                message = (exceptionResponse as any).message || message;
            }
        } else if (exception instanceof Error) {
            // Handle specific custom error names
            switch (exception.name) {
                case 'UserNotConfirmedException':
                    message = 'User is not confirmed.';
                    status = HttpStatus.BAD_REQUEST;
                    break;
                case 'NotAuthorizedException':
                    message = 'Incorrect username or password.';
                    status = HttpStatus.OK;
                    break;
                case 'UsernameExistsException':
                    message = 'User already exists';
                    status = HttpStatus.OK;
                    break;
                case 'ExpiredCodeException':
                case 'CodeMismatchException':
                    message = 'OTP is invalid. Please send again';
                    status = HttpStatus.BAD_REQUEST;
                    break;
                case 'InvalidPasswordException':
                    message = exception.message;
                    status = HttpStatus.OK;
                    break;
                default:
                    message = exception.message || message;
                    break;
            }
        }

        // Log the error details
        const errorPath = `${request.protocol}://${request.get('host')}${request.originalUrl}`;
        const trace = exception instanceof Error ? exception.stack : '';
        const errorObject = exception instanceof Error ? exception : { message, stack: trace };
        const logMessage = `| Path: ${errorPath} | ErrorMessage: ${message} | Status: ${status} | Exception: ${JSON.stringify(errorObject, null, 2)}`;
        this.logger.error(logMessage, trace, errorPath);

        // Return the custom response
        response.status(status).json({
            StatusCode: status,
            Message: message,
            IsSuccess: false,
            Data: null,
        });
    }
}
