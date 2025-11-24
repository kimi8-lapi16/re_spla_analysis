import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserSecret } from 'generated/prisma/client';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { CreateUserDto, UserWithSecret } from './dto';
import { UserUseCase } from './user.usecase';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;
  let userUseCase: jest.Mocked<UserUseCase>;

  const mockUserSecret: UserSecret = {
    userId: 'test-user-id',
    password: 'hashed-password',
  };

  const mockUser: UserWithSecret = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    secret: mockUserSecret,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: UserUseCase,
          useValue: {
            createUserWithSecret: jest.fn(),
            findUserWithSecretByEmail: jest.fn(),
            findUserWithSecretById: jest.fn(),
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

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository) as jest.Mocked<UserRepository>;
    userUseCase = module.get(UserUseCase) as jest.Mocked<UserUseCase>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully create a new user', async () => {
      repository.findByEmail.mockResolvedValue(null);
      userUseCase.createUserWithSecret.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.createUser(createUserDto);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userUseCase.createUserWithSecret).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser = {
        id: 'existing-user-id',
        name: 'Existing User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      repository.findByEmail.mockResolvedValue(existingUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createUser(createUserDto)).rejects.toThrow(
        'Email already exists',
      );

      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userUseCase.createUserWithSecret).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if user creation fails', async () => {
      repository.findByEmail.mockResolvedValue(null);
      userUseCase.createUserWithSecret.mockRejectedValue(
        new InternalServerErrorException('Database error'),
      );
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should hash password with bcrypt before storing', async () => {
      repository.findByEmail.mockResolvedValue(null);
      userUseCase.createUserWithSecret.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('super-hashed-password');

      await service.createUser(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userUseCase.createUserWithSecret).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'super-hashed-password',
        }),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      userUseCase.findUserWithSecretByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(userUseCase.findUserWithSecretByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when user not found', async () => {
      userUseCase.findUserWithSecretByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(userUseCase.findUserWithSecretByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });
  });

  describe('findById', () => {
    const mockUserWithoutSecret = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should return user response when found', async () => {
      repository.findById.mockResolvedValue(mockUserWithoutSecret);

      const result = await service.findById('test-user-id');

      expect(result).toEqual({
        id: mockUserWithoutSecret.id,
        name: mockUserWithoutSecret.name,
        email: mockUserWithoutSecret.email,
        createdAt: mockUserWithoutSecret.createdAt,
        updatedAt: mockUserWithoutSecret.updatedAt,
      });
      expect(repository.findById).toHaveBeenCalledWith('test-user-id');
    });

    it('should return null when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent-id');

      expect(result).toBeNull();
      expect(repository.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });
});
