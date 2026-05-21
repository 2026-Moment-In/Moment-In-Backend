import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { Res } from '@nestjs/common';

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
  async kakaoAuthRedirect(@Req() req, @Res() res) {
    try {
      const result = await this.authService.login(req.user);
      
      const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      res.redirect(`${FRONTEND_URL}/login/callback?token=${result.access_token}`);
    } catch (error : any) {
      console.error("카카오 로그인 리다이렉트 실패:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  }
}