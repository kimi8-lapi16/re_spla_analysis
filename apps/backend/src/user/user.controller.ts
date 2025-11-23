import {
  Body,
  Controller,
  Post,
  Res,
  ValidationPipe
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthTokenResponseDto, CreateUserDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post()
  async createUser(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenResponseDto> {
    const user = await this.userService.createUser(dto);

    const { accessToken, refreshToken } =
      await this.userService.generateTokens(user.id, user.email);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken,
      user,
    };
  }
}
