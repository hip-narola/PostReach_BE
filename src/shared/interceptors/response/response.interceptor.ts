import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ResponseData {
  message?: string;
  data?: unknown;
}

interface StandardResponse {
  StatusCode: number;
  Message: string;
  IsSuccess: boolean;
  Data: unknown | null;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse> | Observable<void> {
    const response = context.switchToHttp().getResponse();
    
    // Check if it's a redirect response
    if (response.statusCode >= 300 && response.statusCode < 400) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: unknown) => {
        const statusCode = response.statusCode || 200;
        
        // Handle case when API returns nothing
        if (data === undefined || data === null) {
          return {
            StatusCode: 200,
            Message: 'Success',
            IsSuccess: true,
            Data: null
          };
        }

        // Handle ResponseData type
        const isResponseData = data &&
          typeof data === 'object' &&
          ('message' in data || 'data' in data);

        if (isResponseData) {
          const responseData = data as ResponseData;
          return {
            StatusCode: 200,
            Message: responseData.message || 'Success',
            IsSuccess: true,
            Data: responseData.data || null
          };
        }

        // Handle direct data return
        return {
          StatusCode: 200,
          Message: 'Success',
          IsSuccess: true,
          Data: data
        };
      }),
    );
  }
}