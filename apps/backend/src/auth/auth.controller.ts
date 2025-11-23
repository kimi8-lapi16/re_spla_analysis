import {
  Body,
  Controller,
  Post,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthTokenResponseDto } from '../user/dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenResponseDto> {
    const { user, accessToken, refreshToken } = await this.authService.login(dto);

    this.authService.setRefreshTokenCookie(res, refreshToken);

    return {
      accessToken,
      user,
    };
  }
}
