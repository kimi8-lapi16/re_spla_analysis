import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  GetCurrentUser,
} from '../common/decorators/current-user.decorator';
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
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiBody({ type: CreateUser })
  async createUser(
    @Body() dto: CreateUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenResponse> {
    const user = await this.userService.createUser(dto);

    const { accessToken, refreshToken } = await this.userService.generateTokens(
      user.id,
      user.email,
    );

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
    @Body() dto: UpdateUser,
  ): Promise<UserDataResponse> {
    const user = await this.userService.updateUser(currentUser.userId, dto);
    return { user };
  }
}
