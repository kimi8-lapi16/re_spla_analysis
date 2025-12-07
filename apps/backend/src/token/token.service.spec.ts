import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate access token with configured secret', () => {
      jwtService.sign.mockReturnValue('access-token');
      configService.get.mockReturnValue('jwt-secret');

      const result = service.generateAccessToken('user-id', 'user@example.com');

      expect(result).toBe('access-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-id', email: 'user@example.com' },
        { secret: 'jwt-secret', expiresIn: '15m' },
      );
    });

    it('should use default secret when not configured', () => {
      jwtService.sign.mockReturnValue('access-token');
      configService.get.mockImplementation(
        (key: string, defaultValue: string) => defaultValue,
      );

      service.generateAccessToken('user-id', 'user@example.com');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-id', email: 'user@example.com' },
        { secret: 'your-secret-key', expiresIn: '15m' },
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with configured secret', () => {
      jwtService.sign.mockReturnValue('refresh-token');
      configService.get.mockReturnValue('jwt-refresh-secret');

      const result = service.generateRefreshToken('user-id', 'user@example.com');

      expect(result).toBe('refresh-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-id', email: 'user@example.com' },
        { secret: 'jwt-refresh-secret', expiresIn: '7d' },
      );
    });

    it('should use default secret when not configured', () => {
      jwtService.sign.mockReturnValue('refresh-token');
      configService.get.mockImplementation(
        (key: string, defaultValue: string) => defaultValue,
      );

      service.generateRefreshToken('user-id', 'user@example.com');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'user-id', email: 'user@example.com' },
        { secret: 'your-refresh-secret-key', expiresIn: '7d' },
      );
    });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', () => {
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      configService.get
        .mockReturnValueOnce('jwt-secret')
        .mockReturnValueOnce('jwt-refresh-secret');

      const result = service.generateTokens('user-id', 'user@example.com');

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });
});
