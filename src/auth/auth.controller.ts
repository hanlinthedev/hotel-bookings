import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google OAuth redirect
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const tokens = await this.authService.googleLogin(req.user);
    const clientUrl = this.configService.get('CLIENT_URL');
    res.redirect(
      `${clientUrl}/api/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }

  @Post('refresh')
  async refreshToken(@Body() data: { refreshToken: string }) {
    return this.authService.refreshTokens(data.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body() data: { refreshToken: string }) {
    return this.authService.logout(data.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req) {
    const user = await this.authService.getUserById(req.user.userId);
    return user;
  }
}
