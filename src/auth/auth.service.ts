import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private loyaltyService: LoyaltyService,
  ) {}

  async googleLogin(user: any) {
    if (!user) {
      throw new UnauthorizedException('No user from Google');
    }

    let userEntity = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: user.googleId }, { email: user.email }],
      },
    });

    if (!userEntity) {
      userEntity = await this.prisma.user.create({
        data: {
          email: user.email,
          googleId: user.googleId,
          firstName: user.firstName,
          lastName: user.lastName,
          picture: user.picture,
        },
      });

      // Create loyalty account for new user
      await this.loyaltyService.getOrCreateAccount(userEntity.id);
    }

    return this.generateTokens(userEntity);
  }

  private async generateTokens(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken: refreshToken.id,
    };
  }

  async refreshTokens(refreshTokenId: string) {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        id: refreshTokenId,
        revokedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      // Detect potential token reuse
      if (refreshToken?.revokedAt) {
        // If token was already revoked, revoke all tokens from this user
        await this.prisma.refreshToken.updateMany({
          where: { userId: refreshToken.userId },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke the used refresh token
    await this.prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    return this.generateTokens(refreshToken.user);
  }

  async logout(refreshTokenId: string) {
    await this.prisma.refreshToken.update({
      where: { id: refreshTokenId },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        picture: true,
      },
    });
    return user;
  }
}
