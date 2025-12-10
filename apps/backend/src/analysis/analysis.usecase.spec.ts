import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisUseCase } from './analysis.usecase';
import { PrismaService } from '../prisma/prisma.service';
import { GroupByField } from './analysis.dto';

type MockPrismaService = {
  $queryRaw: jest.Mock;
  match: {
    findMany: jest.Mock;
  };
};

describe('AnalysisUseCase', () => {
  let useCase: AnalysisUseCase;
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisUseCase,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
            match: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<AnalysisUseCase>(AnalysisUseCase);
    prismaService = module.get<MockPrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getVictoryRate', () => {
    it('should return victory rates grouped by rule', async () => {
      const userId = 'test-user-id';
      const groupBy = [GroupByField.RULE];

      // Mock both calls - one for data, one for count
      prismaService.$queryRaw
        .mockResolvedValueOnce([
          {
            rule_name: 'Splat Zones',
            total_count: BigInt(10),
            win_count: BigInt(7),
          },
        ])
        .mockResolvedValueOnce([{ count: BigInt(1) }]);

      const result = await useCase.getVictoryRate({ userId, groupBy });

      expect(result.victoryRates).toEqual([
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
      expect(result.total).toBe(1);
      expect(prismaService.$queryRaw).toHaveBeenCalledTimes(2);
    });

    it('should return victory rates grouped by multiple fields', async () => {
      const userId = 'test-user-id';
      const groupBy = [GroupByField.RULE, GroupByField.STAGE];

      prismaService.$queryRaw
        .mockResolvedValueOnce([
          {
            rule_name: 'Splat Zones',
            stage_name: 'Scorch Gorge',
            total_count: BigInt(5),
            win_count: BigInt(3),
          },
          {
            rule_name: 'Tower Control',
            stage_name: 'Inkblot Art Academy',
            total_count: BigInt(8),
            win_count: BigInt(6),
          },
        ])
        .mockResolvedValueOnce([{ count: BigInt(2) }]);

      const result = await useCase.getVictoryRate({ userId, groupBy });

      expect(result.victoryRates).toHaveLength(2);
      expect(result.victoryRates[0]).toEqual({
        ruleName: 'Splat Zones',
        stageName: 'Scorch Gorge',
        weaponName: undefined,
        battleTypeName: undefined,
        totalCount: 5,
        winCount: 3,
        victoryRate: 0.6,
      });
      expect(result.victoryRates[1]).toEqual({
        ruleName: 'Tower Control',
        stageName: 'Inkblot Art Academy',
        weaponName: undefined,
        battleTypeName: undefined,
        totalCount: 8,
        winCount: 6,
        victoryRate: 0.75,
      });
      expect(result.total).toBe(2);
    });

    it('should return victory rates grouped by all fields', async () => {
      const userId = 'test-user-id';
      const groupBy = [
        GroupByField.RULE,
        GroupByField.STAGE,
        GroupByField.WEAPON,
        GroupByField.BATTLE_TYPE,
      ];

      prismaService.$queryRaw
        .mockResolvedValueOnce([
          {
            rule_name: 'Splat Zones',
            stage_name: 'Scorch Gorge',
            weapon_name: 'Splattershot',
            battle_type_name: 'Ranked Battle',
            total_count: BigInt(3),
            win_count: BigInt(2),
          },
        ])
        .mockResolvedValueOnce([{ count: BigInt(1) }]);

      const result = await useCase.getVictoryRate({ userId, groupBy });

      expect(result.victoryRates[0].victoryRate).toBeCloseTo(0.6667, 4);
      expect(result.victoryRates).toEqual([
        {
          ruleName: 'Splat Zones',
          stageName: 'Scorch Gorge',
          weaponName: 'Splattershot',
          battleTypeName: 'Ranked Battle',
          totalCount: 3,
          winCount: 2,
          victoryRate: expect.any(Number),
        },
      ]);
    });

    it('should return empty array when no matches found', async () => {
      const userId = 'test-user-id';
      const groupBy = [GroupByField.RULE];

      prismaService.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: BigInt(0) }]);

      const result = await useCase.getVictoryRate({ userId, groupBy });

      expect(result.victoryRates).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getPointTransition', () => {
    it('should return point transition data for a specific rule and battle type', async () => {
      const userId = 'test-user-id';
      const ruleId = 1;
      const battleTypeId = 2;

      const mockMatches = [
        { gameDateTime: new Date('2024-11-01T10:00:00Z'), point: 1500 },
        { gameDateTime: new Date('2024-11-02T10:00:00Z'), point: 1520 },
        { gameDateTime: new Date('2024-11-03T10:00:00Z'), point: 1510 },
      ];

      prismaService.match.findMany.mockResolvedValue(mockMatches);

      const result = await useCase.getPointTransition(
        userId,
        ruleId,
        battleTypeId,
      );

      expect(result).toEqual([
        { gameDateTime: new Date('2024-11-01T10:00:00Z'), point: 1500 },
        { gameDateTime: new Date('2024-11-02T10:00:00Z'), point: 1520 },
        { gameDateTime: new Date('2024-11-03T10:00:00Z'), point: 1510 },
      ]);
      expect(prismaService.match.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          ruleId,
          battleTypeId,
          point: { not: null },
          gameDateTime: undefined,
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
      const battleTypeId = 2;
      const startDate = new Date('2024-11-01T00:00:00Z');
      const endDate = new Date('2024-11-30T23:59:59Z');

      prismaService.match.findMany.mockResolvedValue([]);

      await useCase.getPointTransition(
        userId,
        ruleId,
        battleTypeId,
        startDate,
        endDate,
      );

      expect(prismaService.match.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          ruleId,
          battleTypeId,
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
      const battleTypeId = 2;
      const startDate = new Date('2024-11-01T00:00:00Z');

      prismaService.match.findMany.mockResolvedValue([]);

      await useCase.getPointTransition(
        userId,
        ruleId,
        battleTypeId,
        startDate,
        undefined,
      );

      expect(prismaService.match.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          ruleId,
          battleTypeId,
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
      const battleTypeId = 2;
      const endDate = new Date('2024-11-30T23:59:59Z');

      prismaService.match.findMany.mockResolvedValue([]);

      await useCase.getPointTransition(
        userId,
        ruleId,
        battleTypeId,
        undefined,
        endDate,
      );

      expect(prismaService.match.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          ruleId,
          battleTypeId,
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
      const battleTypeId = 2;

      prismaService.match.findMany.mockResolvedValue([]);

      const result = await useCase.getPointTransition(
        userId,
        ruleId,
        battleTypeId,
      );

      expect(result).toEqual([]);
    });
  });
});
