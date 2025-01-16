import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookPageAuthGuard extends AuthGuard('facebook-page') {
  handleRequest(err, user, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const error = request.query.error;
    if (error === 'access_denied') {
      return null;
    }
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
