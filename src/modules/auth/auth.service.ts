import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(provider: string, socialId: string, displayName: string) {
    let user = await this.prisma.user.findFirst({
      where: { provider, social_id: socialId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { provider, social_id: socialId, display_name: displayName },
      });
    } else if (displayName && user.display_name !== displayName) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { display_name: displayName },
      });
    }

    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, displayName: user.display_name };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}