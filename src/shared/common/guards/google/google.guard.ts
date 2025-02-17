import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class GoogleGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.query = { ...request.query, prompt: 'select_account' }; // Ensures Google shows the account selection screen
    return (await super.canActivate(context)) as boolean;
  }
}
