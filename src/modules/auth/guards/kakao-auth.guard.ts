import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class KakaoAuthGuard extends AuthGuard('kakao') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    return {
        prompt: request.query.prompt,
    };
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      return null;
    }

    return user;
  }
}
