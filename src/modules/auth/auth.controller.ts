import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // 리디렉션 처리
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req) {
    return this.authService.login(req.user);
  }

  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  async kakaoAuth() {
    // 리디렉션 처리
  }

  @Get('kakao/callback')
  @UseGuards(KakaoAuthGuard)
  async kakaoAuthRedirect(@Req() req) {
    return this.authService.login(req.user);
  }
}