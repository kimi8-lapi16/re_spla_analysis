import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'generated/prisma/client';
import { UserRepository } from './user.repository';
import { PrismaService } from '../prisma/prisma.service';

type MockPrismaService = {
  user: {
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaService: MockPrismaService;

  const mockUser: User = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<MockPrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createData = {
        name: 'Test User',
        email: 'test@example.com',
      };

      prismaService.user.create.mockResolvedValue(mockUser);

      const result = await repository.create(createData);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          email: 'test@example.com',
        },
      });
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById('test-user-id');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      });
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updatedUser: User = { ...mockUser, name: 'Updated Name' };
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await repository.update('test-user-id', {
        name: 'Updated Name',
      });

      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        data: { name: 'Updated Name' },
      });
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      prismaService.user.delete.mockResolvedValue(mockUser);

      const result = await repository.delete('test-user-id');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      });
    });
  });
});
