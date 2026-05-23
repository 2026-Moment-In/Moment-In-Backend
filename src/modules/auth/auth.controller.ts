import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req) {
    return req.user;
  }

  @Get('dev')
  async devLogin() {
    const user = await this.authService.validateUser('local', 'dev-user', 'Dev User');
    return this.authService.login(user);
  }

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
  async kakaoAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.login(req.user);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth/callback?token=${result.access_token}`);
  }
}
