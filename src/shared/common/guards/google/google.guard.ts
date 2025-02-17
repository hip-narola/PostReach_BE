import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Ensure the `prompt` parameter is set correctly
    request.query = { ...request.query,
                        prompt: 'select_account',
                        auth_type: 'reauthenticate'
                    };

    return (await super.canActivate(context)) as boolean;
  }

  handleRequest(err, user, info, context) {
    if (err || !user) {
      throw err || new Error('User not authenticated');
    }
    return user;
  }
}
