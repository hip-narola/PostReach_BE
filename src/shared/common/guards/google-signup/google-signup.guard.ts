import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleSignupGuard extends AuthGuard('google') {
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
