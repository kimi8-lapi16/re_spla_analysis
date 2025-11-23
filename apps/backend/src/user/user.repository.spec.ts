import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUserWithSecret = {
    ...mockUser,
    secret: {
      userId: 'test-user-id',
      password: 'hashed-password',
    },
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
            },
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with secret', async () => {
      const createData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
      };

      prismaService.user.create.mockResolvedValue(mockUserWithSecret as any);

      const result = await repository.create(createData);

      expect(result).toEqual(mockUserWithSecret);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          secret: {
            create: {
              password: 'hashed-password',
            },
          },
        },
        include: {
          secret: true,
        },
      });
    });
  });

  describe('findByEmail', () => {
    it('should find user by email with secret', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserWithSecret as any);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockUserWithSecret);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: {
          secret: true,
        },
      });
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id without secret', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser as any);

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

  describe('findByIdWithSecret', () => {
    it('should find user by id with secret', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUserWithSecret as any);

      const result = await repository.findByIdWithSecret('test-user-id');

      expect(result).toEqual(mockUserWithSecret);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        include: {
          secret: true,
        },
      });
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByIdWithSecret('non-existent-id');

      expect(result).toBeNull();
    });
  });
});
