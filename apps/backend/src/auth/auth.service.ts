import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../token/token.service';
import { UserService } from '../user/user.service';
import { LoginRequest } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<string> {
    const user = await this.userService.findByEmail(email);

    if (!user || !user.secret) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.secret.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user.id;
  }

  async login(dto: LoginRequest) {
    const userId = await this.validateUser(dto.email, dto.password);
    const user = await this.userService.findById(userId);
    const email = user?.email ?? '';

    return this.tokenService.generateTokens({ userId, email });
  }

  async refresh(userId: string) {
    const user = await this.userService.findById(userId);
    const email = user?.email ?? '';
    const accessToken = this.tokenService.generateAccessToken({
      userId,
      email,
    });

    return { accessToken };
  }
}
