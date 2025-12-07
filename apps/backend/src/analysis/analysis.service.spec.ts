import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisService } from './analysis.service';
import { AnalysisUseCase } from './analysis.usecase';
import {
  GetVictoryRateRequest,
  GetPointTransitionRequest,
  GroupByField,
} from './analysis.dto';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let analysisUseCase: jest.Mocked<AnalysisUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        {
          provide: AnalysisUseCase,
          useValue: {
            getVictoryRate: jest.fn(),
            getPointTransition: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
    analysisUseCase = module.get(AnalysisUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getVictoryRate', () => {
    it('should return victory rates from use case', async () => {
      const userId = 'test-user-id';
      const request: GetVictoryRateRequest = {
        groupBy: [GroupByField.RULE, GroupByField.STAGE],
      };

      const mockVictoryRates = [
        {
          ruleName: 'Splat Zones',
          stageName: 'Scorch Gorge',
          totalCount: 10,
          winCount: 7,
          victoryRate: 0.7,
        },
      ];

      analysisUseCase.getVictoryRate.mockResolvedValue(mockVictoryRates);

      const result = await service.getVictoryRate(userId, request);

      expect(result).toEqual({ victoryRates: mockVictoryRates });
      expect(analysisUseCase.getVictoryRate).toHaveBeenCalledWith(userId, [
        GroupByField.RULE,
        GroupByField.STAGE,
      ]);
    });

    it('should return empty victory rates when no data', async () => {
      const userId = 'test-user-id';
      const request: GetVictoryRateRequest = {
        groupBy: [GroupByField.WEAPON],
      };

      analysisUseCase.getVictoryRate.mockResolvedValue([]);

      const result = await service.getVictoryRate(userId, request);

      expect(result).toEqual({ victoryRates: [] });
    });
  });

  describe('getPointTransition', () => {
    it('should return point transition data from use case', async () => {
      const userId = 'test-user-id';
      const request: GetPointTransitionRequest = {
        ruleId: 1,
        battleTypeId: 2,
      };

      const mockPoints = [
        { gameDateTime: new Date('2024-11-01T10:00:00Z'), point: 1500 },
        { gameDateTime: new Date('2024-11-02T10:00:00Z'), point: 1520 },
      ];

      analysisUseCase.getPointTransition.mockResolvedValue(mockPoints);

      const result = await service.getPointTransition(userId, request);

      expect(result).toEqual({
        points: [
          { gameDateTime: '2024-11-01T10:00:00.000Z', point: 1500 },
          { gameDateTime: '2024-11-02T10:00:00.000Z', point: 1520 },
        ],
      });
      expect(analysisUseCase.getPointTransition).toHaveBeenCalledWith(
        userId,
        1,
        2,
        undefined,
        undefined,
      );
    });

    it('should pass date range to use case when provided', async () => {
      const userId = 'test-user-id';
      const request: GetPointTransitionRequest = {
        ruleId: 1,
        battleTypeId: 2,
        startDate: '2024-11-01T00:00:00Z',
        endDate: '2024-11-30T23:59:59Z',
      };

      analysisUseCase.getPointTransition.mockResolvedValue([]);

      await service.getPointTransition(userId, request);

      expect(analysisUseCase.getPointTransition).toHaveBeenCalledWith(
        userId,
        1,
        2,
        new Date(2024, 10, 1, 0, 0, 0),
        new Date(2024, 10, 30, 23, 59, 59),
      );
    });

    it('should return empty points when no data', async () => {
      const userId = 'test-user-id';
      const request: GetPointTransitionRequest = {
        ruleId: 999,
        battleTypeId: 2,
      };

      analysisUseCase.getPointTransition.mockResolvedValue([]);

      const result = await service.getPointTransition(userId, request);

      expect(result).toEqual({ points: [] });
    });
  });
});
