import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleSignupGuard extends AuthGuard('google') {
  constructor() {
    super();
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    return user;
  }
}
