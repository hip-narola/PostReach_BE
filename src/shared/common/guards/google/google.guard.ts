import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class GoogleGuard  extends AuthGuard('google') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.query = { ...request.query, prompt: 'select_account' };
    return true;
  }
}
