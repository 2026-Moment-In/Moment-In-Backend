import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { AuthService } from '../auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID || 'local-kakao-client-id',
      clientSecret: process.env.KAKAO_CLIENT_SECRET || 'local-kakao-client-secret',
      callbackURL: process.env.KAKAO_CALLBACK_URL || 'http://localhost:3000/auth/kakao/callback',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const { id } = profile;
    const displayName =
      profile.username ||
      profile.displayName ||
      profile._json?.kakao_account?.profile?.nickname ||
      profile._json?.properties?.nickname ||
      '카카오 사용자';
    const user = await this.authService.validateUser('kakao', String(id), displayName);
    done(null, user);
  }
}
