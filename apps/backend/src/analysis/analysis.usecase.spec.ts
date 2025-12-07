import { Test, TestingModule } from '@nestjs/testing';
import {
  GetVictoryRateUseCase,
  GetPointTransitionUseCase,
} from './analysis.usecase';
import { PrismaService } from '../prisma/prisma.service';
import { GroupByField } from './analysis.dto';

type MockPrismaService = {
  $queryRaw: jest.Mock;
  match: {
    findMany: jest.Mock;
  };
};

describe('GetVictoryRateUseCase', () => {
  let useCase: GetVictoryRateUseCase;
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetVictoryRateUseCase,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetVictoryRateUseCase>(GetVictoryRateUseCase);
    prismaService = module.get<MockPrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return victory rates grouped by rule', async () => {
      const userId = 'test-user-id';
      const groupBy = [GroupByField.RULE];

      prismaService.$queryRaw.mockResolvedValue([
        {
          rule_name: 'Splat Zones',
          total_count: BigInt(10),
          win_count: BigInt(7),
          victory_rate: '0.7000',
        },
      ]);

      const result = await useCase.execute(userId, groupBy);

      expect(result).toEqual([
        {
          ruleName: 'Splat Zones',
          stageName: undefined,
          weaponName: undefined,
          battleTypeName: undefined,
          totalCount: 10,
          winCount: 7,
          victoryRate: 0.7,
        },
      ]);
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should return victory rates grouped by multiple fields', async () => {
      const userId = 'test-user-id';
      const groupBy = [GroupByField.RULE, GroupByField.STAGE];

      prismaService.$queryRaw.mockResolvedValue([
        {
          rule_name: 'Splat Zones',
          stage_name: 'Scorch Gorge',
          total_count: BigInt(5),
          win_count: BigInt(3),
          victory_rate: '0.6000',
        },
        {
          rule_name: 'Tower Control',
          stage_name: 'Inkblot Art Academy',
          total_count: BigInt(8),
          win_count: BigInt(6),
          victory_rate: '0.7500',
        },
      ]);

      const result = await useCase.execute(userId, groupBy);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ruleName: 'Splat Zones',
        stageName: 'Scorch Gorge',
        weaponName: undefined,
        battleTypeName: undefined,
        totalCount: 5,
        winCount: 3,
        victoryRate: 0.6,
      });
      expect(result[1]).toEqual({
        ruleName: 'Tower Control',
        stageName: 'Inkblot Art Academy',
        weaponName: undefined,
        battleTypeName: undefined,
        totalCount: 8,
        winCount: 6,
        victoryRate: 0.75,
      });
    });

    it('should return victory rates grouped by all fields', async () => {
      const userId = 'test-user-id';
      const groupBy = [
        GroupByField.RULE,
        GroupByField.STAGE,
        GroupByField.WEAPON,
        GroupByField.BATTLE_TYPE,
      ];

      prismaService.$queryRaw.mockResolvedValue([
        {
          rule_name: 'Splat Zones',
          stage_name: 'Scorch Gorge',
          weapon_name: 'Splattershot',
          battle_type_name: 'Ranked Battle',
          total_count: BigInt(3),
          win_count: BigInt(2),
          victory_rate: '0.6667',
        },
      ]);

      const result = await useCase.execute(userId, groupBy);

      expect(result).toEqual([
        {
          ruleName: 'Splat Zones',
          stageName: 'Scorch Gorge',
          weaponName: 'Splattershot',
          battleTypeName: 'Ranked Battle',
          totalCount: 3,
          winCount: 2,
          victoryRate: 0.6667,
        },
      ]);
    });

    it('should return empty array when no matches found', async () => {
      const userId = 'test-user-id';
      const groupBy = [GroupByField.RULE];

      prismaService.$queryRaw.mockResolvedValue([]);

      const result = await useCase.execute(userId, groupBy);

      expect(result).toEqual([]);
    });
  });
});

describe('GetPointTransitionUseCase', () => {
  let useCase: GetPointTransitionUseCase;
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPointTransitionUseCase,
        {
          provide: PrismaService,
          useValue: {
            match: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<GetPointTransitionUseCase>(GetPointTransitionUseCase);
    prismaService = module.get<MockPrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return point transition data for a specific rule', async () => {
      const userId = 'test-user-id';
      const ruleId = 1;

      const mockMatches = [
        { gameDateTime: new Date('2024-11-01T10:00:00Z'), point: 1500 },
        { gameDateTime: new Date('2024-11-02T10:00:00Z'), point: 1520 },
        { gameDateTime: new Date('2024-11-03T10:00:00Z'), point: 1510 },
      ];

      prismaService.match.findMany.mockResolvedValue(mockMatches);

      const result = await useCase.execute(userId, ruleId);

      expect(result).toEqual([
        { gameDateTime: new Date('2024-11-01T10:00:00Z'), point: 1500 },
        { gameDateTime: new Date('2024-11-02T10:00:00Z'), point: 1520 },
        { gameDateTime: new Date('2024-11-03T10:00:00Z'), point: 1510 },
      ]);
      expect(prismaService.match.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          ruleId,
          point: { not: null },
        },
        select: {
          gameDateTime: true,
          point: true,
        },
        orderBy: {
          gameDateTime: 'asc',
        },
      });
    });

    it('should filter by date range when provided', async () => {
      const userId = 'test-user-id';
      const ruleId = 1;
      const startDate = new Date('2024-11-01T00:00:00Z');
      const endDate = new Date('2024-11-30T23:59:59Z');

      prismaService.match.findMany.mockResolvedValue([]);

      await useCase.execute(userId, ruleId, startDate, endDate);

      expect(prismaService.match.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          ruleId,
          point: { not: null },
          gameDateTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          gameDateTime: true,
          point: true,
        },
        orderBy: {
          gameDateTime: 'asc',
        },
      });
    });

    it('should filter by start date only when endDate is not provided', async () => {
      const userId = 'test-user-id';
      const ruleId = 1;
      const startDate = new Date('2024-11-01T00:00:00Z');

      prismaService.match.findMany.mockResolvedValue([]);

      await useCase.execute(userId, ruleId, startDate, undefined);

      expect(prismaService.match.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          ruleId,
          point: { not: null },
          gameDateTime: {
            gte: startDate,
          },
        },
        select: {
          gameDateTime: true,
          point: true,
        },
        orderBy: {
          gameDateTime: 'asc',
        },
      });
    });

    it('should filter by end date only when startDate is not provided', async () => {
      const userId = 'test-user-id';
      const ruleId = 1;
      const endDate = new Date('2024-11-30T23:59:59Z');

      prismaService.match.findMany.mockResolvedValue([]);

      await useCase.execute(userId, ruleId, undefined, endDate);

      expect(prismaService.match.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          ruleId,
          point: { not: null },
          gameDateTime: {
            lte: endDate,
          },
        },
        select: {
          gameDateTime: true,
          point: true,
        },
        orderBy: {
          gameDateTime: 'asc',
        },
      });
    });

    it('should return empty array when no matches found', async () => {
      const userId = 'test-user-id';
      const ruleId = 1;

      prismaService.match.findMany.mockResolvedValue([]);

      const result = await useCase.execute(userId, ruleId);

      expect(result).toEqual([]);
    });
  });
});
