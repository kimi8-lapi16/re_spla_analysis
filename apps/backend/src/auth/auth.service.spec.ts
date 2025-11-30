import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginDto, ResponseWithCookie } from './auth.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    secret: {
      userId: 'test-user-id',
      password: 'hashed-password',
    },
  };

  const mockUserResponse = {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
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

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService) as jest.Mocked<UserService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(mockUserResponse);
      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        'hashed-password',
      );
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user has no secret', async () => {
      const userWithoutSecret = { ...mockUser, secret: null };
      userService.findByEmail.mockResolvedValue(userWithoutSecret);

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong-password',
        'hashed-password',
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password',
    };

    it('should return user and tokens on successful login', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.findById.mockResolvedValue(mockUserResponse);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      configService.get
        .mockReturnValueOnce('jwt-secret')
        .mockReturnValueOnce('jwt-refresh-secret');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: mockUserResponse,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      userService.findById.mockResolvedValue(mockUserResponse);
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      configService.get
        .mockReturnValueOnce('jwt-secret')
        .mockReturnValueOnce('jwt-refresh-secret');

      const result = await service.generateTokens('test-user-id');

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'test-user-id', email: 'test@example.com' },
        { secret: 'jwt-secret', expiresIn: '15m' },
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'test-user-id', email: 'test@example.com' },
        { secret: 'jwt-refresh-secret', expiresIn: '7d' },
      );
    });

    it('should generate tokens with empty email if user not found', async () => {
      userService.findById.mockResolvedValue(null);
      jwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      configService.get
        .mockReturnValueOnce('jwt-secret')
        .mockReturnValueOnce('jwt-refresh-secret');

      const result = await service.generateTokens('non-existent-id');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'non-existent-id', email: '' },
        expect.any(Object),
      );
    });
  });

  describe('setRefreshTokenCookie', () => {
    it('should set refresh token cookie with correct options', () => {
      const mockResponse: ResponseWithCookie = {
        cookie: jest.fn().mockReturnThis(),
      };

      configService.get.mockReturnValue('development');

      service.setRefreshTokenCookie(mockResponse, 'refresh-token');

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      );
    });

    it('should set secure flag in production', () => {
      const mockResponse: ResponseWithCookie = {
        cookie: jest.fn().mockReturnThis(),
      };

      configService.get.mockReturnValue('production');

      service.setRefreshTokenCookie(mockResponse, 'refresh-token');

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      );
    });
  });
});
