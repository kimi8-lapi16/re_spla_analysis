import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findByIdWithSecret: jest.fn(),
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
      repository.create.mockResolvedValue(mockUser);
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
      expect(repository.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createUser(createUserDto)).rejects.toThrow(
        'Email already exists',
      );

      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if user creation fails', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.createUser(createUserDto)).rejects.toThrow(
        'Failed to create user',
      );
    });

    it('should hash password with bcrypt before storing', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('super-hashed-password');

      await service.createUser(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'super-hashed-password',
        }),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when user not found', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(repository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
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
