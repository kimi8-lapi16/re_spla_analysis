import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { TokenService } from '../token/token.service';
import {
  CurrentUser,
  GetCurrentUser,
} from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  AuthTokenResponse,
  CreateUser,
  UpdateUser,
  UserDataResponse,
} from './user.dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  @Post()
  @ApiBody({ type: CreateUser })
  async createUser(
    @Body() body: CreateUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenResponse> {
    const user = await this.userService.createUser(body);
    const { accessToken, refreshToken } = this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
    });

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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMe(
    @GetCurrentUser() currentUser: CurrentUser,
  ): Promise<UserDataResponse> {
    const user = await this.userService.findById(currentUser.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return { user };
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateUser })
  async updateMe(
    @GetCurrentUser() currentUser: CurrentUser,
    @Body() body: UpdateUser,
  ): Promise<UserDataResponse> {
    const user = await this.userService.updateUser(currentUser.userId, body);
    return { user };
  }
}
