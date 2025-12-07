import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  GeneratedTokens,
  GenerateTokenParameter,
  TokenPayload,
} from './token.dto';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken({ userId, email }: GenerateTokenParameter): string {
    const payload: TokenPayload = { sub: userId, email };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'your-secret-key'),
      expiresIn: '15m',
    });
  }

  generateRefreshToken({ userId, email }: GenerateTokenParameter): string {
    const payload: TokenPayload = { sub: userId, email };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(
        'JWT_REFRESH_SECRET',
        'your-refresh-secret-key',
      ),
      expiresIn: '7d',
    });
  }

  generateTokens(param: GenerateTokenParameter): GeneratedTokens {
    return {
      accessToken: this.generateAccessToken(param),
      refreshToken: this.generateRefreshToken(param),
    };
  }
}
