import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookSignupAuthGuard extends AuthGuard('facebook') {
  handleRequest(err, user, info, context: ExecutionContext) {
    return user;
  }
}
