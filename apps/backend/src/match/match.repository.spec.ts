import { Test, TestingModule } from '@nestjs/testing';
import { MatchRepository } from './match.repository';
import { UpdateMatch } from './match.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Match as PrismaMatch } from 'generated/prisma/client';

type MockPrismaService = {
  match: {
    createMany: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
    update: jest.Mock;
    deleteMany: jest.Mock;
  };
};

describe('MatchRepository', () => {
  let repository: MatchRepository;
  let prismaService: MockPrismaService;

  const mockPrismaMatch: PrismaMatch = {
    id: 'test-match-id',
    userId: 'test-user-id',
    weaponId: 1,
    stageId: 2,
    ruleId: 3,
    battleTypeId: 4,
    result: 'WIN',
    gameDateTime: new Date('2024-11-24T10:30:00Z'),
    point: 1500,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchRepository,
        {
          provide: PrismaService,
          useValue: {
            match: {
              createMany: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<MatchRepository>(MatchRepository);
    prismaService = module.get<MockPrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserIdAndIds', () => {
    it('should return matches that belong to the user', async () => {
      const userId = 'test-user-id';
      const ids = ['match-1', 'match-2'];

      const prismaMatches: PrismaMatch[] = [
        { ...mockPrismaMatch, id: 'match-1' },
        { ...mockPrismaMatch, id: 'match-2' },
      ];

      prismaService.match.findMany.mockResolvedValue(prismaMatches);

      const result = await repository.findByUserIdAndIds(userId, ids);

      expect(prismaService.match.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ids },
          userId,
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('match-1');
      expect(result[1].id).toBe('match-2');
    });

    it('should return empty array when no matches found', async () => {
      const userId = 'test-user-id';
      const ids = ['non-existent-id'];

      prismaService.match.findMany.mockResolvedValue([]);

      const result = await repository.findByUserIdAndIds(userId, ids);

      expect(result).toHaveLength(0);
    });

    it('should only return matches owned by the specified user', async () => {
      const userId = 'user-1';
      const ids = ['match-1', 'match-2'];

      // Only match-1 belongs to user-1
      const prismaMatches: PrismaMatch[] = [
        { ...mockPrismaMatch, id: 'match-1', userId: 'user-1' },
      ];

      prismaService.match.findMany.mockResolvedValue(prismaMatches);

      const result = await repository.findByUserIdAndIds(userId, ids);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('match-1');
    });
  });

  describe('updateOne', () => {
    it('should update a single match with all fields', async () => {
      const matchId = 'test-match-id';
      const updateData: UpdateMatch = {
        ruleId: 5,
        weaponId: 6,
        stageId: 7,
        battleTypeId: 8,
        result: 'LOSE',
        gameDateTime: new Date('2024-12-01T15:00:00Z'),
        point: 2000,
      };

      const updatedPrismaMatch: PrismaMatch = {
        ...mockPrismaMatch,
        ...updateData,
      };

      prismaService.match.update.mockResolvedValue(updatedPrismaMatch);

      const result = await repository.updateOne(matchId, updateData);

      expect(prismaService.match.update).toHaveBeenCalledWith({
        where: { id: matchId },
        data: updateData,
      });
      expect(result.ruleId).toBe(5);
      expect(result.weaponId).toBe(6);
      expect(result.result).toBe('LOSE');
      expect(result.point).toBe(2000);
    });

    it('should update a match with null point', async () => {
      const matchId = 'test-match-id';
      const updateData: UpdateMatch = {
        ruleId: 1,
        weaponId: 1,
        stageId: 1,
        battleTypeId: 1,
        result: 'WIN',
        gameDateTime: new Date('2024-12-01T15:00:00Z'),
        point: null,
      };

      const updatedPrismaMatch: PrismaMatch = {
        ...mockPrismaMatch,
        ...updateData,
      };

      prismaService.match.update.mockResolvedValue(updatedPrismaMatch);

      const result = await repository.updateOne(matchId, updateData);

      expect(result.point).toBeNull();
    });

    it('should accept optional transaction parameter', async () => {
      const matchId = 'test-match-id';
      const updateData: UpdateMatch = {
        ruleId: 1,
        weaponId: 1,
        stageId: 1,
        battleTypeId: 1,
        result: 'WIN',
        gameDateTime: new Date('2024-12-01T15:00:00Z'),
        point: null,
      };

      const mockTx = {
        match: {
          update: jest.fn().mockResolvedValue({ ...mockPrismaMatch, ...updateData }),
        },
      };

      const result = await repository.updateOne(matchId, updateData, mockTx as never);

      expect(mockTx.match.update).toHaveBeenCalledWith({
        where: { id: matchId },
        data: updateData,
      });
      expect(prismaService.match.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple matches by user id and match ids', async () => {
      const userId = 'test-user-id';
      const ids = ['match-1', 'match-2', 'match-3'];

      prismaService.match.deleteMany.mockResolvedValue({ count: 3 });

      await repository.deleteMany(userId, ids);

      expect(prismaService.match.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: ids },
          userId,
        },
      });
    });

    it('should handle empty ids array', async () => {
      const userId = 'test-user-id';
      const ids: string[] = [];

      prismaService.match.deleteMany.mockResolvedValue({ count: 0 });

      await repository.deleteMany(userId, ids);

      expect(prismaService.match.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: [] },
          userId,
        },
      });
    });

    it('should only delete matches owned by the specified user', async () => {
      const userId = 'user-1';
      const ids = ['match-1', 'match-2'];

      prismaService.match.deleteMany.mockResolvedValue({ count: 1 });

      await repository.deleteMany(userId, ids);

      expect(prismaService.match.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: ids },
          userId: 'user-1',
        },
      });
    });

    it('should accept optional transaction parameter', async () => {
      const userId = 'test-user-id';
      const ids = ['match-1'];

      const mockTx = {
        match: {
          deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      };

      await repository.deleteMany(userId, ids, mockTx as never);

      expect(mockTx.match.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: ids },
          userId,
        },
      });
      expect(prismaService.match.deleteMany).not.toHaveBeenCalled();
    });
  });
});
