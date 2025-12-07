import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../token/token.service';
import { UserService } from '../user/user.service';
import { LoginRequest } from './auth.dto';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let tokenService: jest.Mocked<TokenService>;

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
          provide: TokenService,
          useValue: {
            generateTokens: jest.fn(),
            generateAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService) as jest.Mocked<UserService>;
    tokenService = module.get(TokenService) as jest.Mocked<TokenService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user id when credentials are valid', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBe(mockUser.id);
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
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'password',
    };

    it('should return tokens on successful login', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      userService.findById.mockResolvedValue(mockUserResponse);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      tokenService.generateTokens.mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await service.login(request);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(tokenService.generateTokens).toHaveBeenCalledWith({
        userId: 'test-user-id',
        email: 'test@example.com',
      });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should return new access token', async () => {
      userService.findById.mockResolvedValue(mockUserResponse);
      tokenService.generateAccessToken.mockReturnValue('new-access-token');

      const result = await service.refresh('test-user-id');

      expect(result).toEqual({ accessToken: 'new-access-token' });
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
        userId: 'test-user-id',
        email: 'test@example.com',
      });
    });

    it('should use empty email if user not found', async () => {
      userService.findById.mockResolvedValue(null);
      tokenService.generateAccessToken.mockReturnValue('new-access-token');

      const result = await service.refresh('non-existent-id');

      expect(result).toEqual({ accessToken: 'new-access-token' });
      expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
        userId: 'non-existent-id',
        email: '',
      });
    });
  });
});
