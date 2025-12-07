import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisService } from './analysis.service';
import {
  GetVictoryRateUseCase,
  GetPointTransitionUseCase,
} from './analysis.usecase';
import {
  GetVictoryRateRequest,
  GetPointTransitionRequest,
  GroupByField,
} from './analysis.dto';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let getVictoryRateUseCase: jest.Mocked<GetVictoryRateUseCase>;
  let getPointTransitionUseCase: jest.Mocked<GetPointTransitionUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        {
          provide: GetVictoryRateUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetPointTransitionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
    getVictoryRateUseCase = module.get(GetVictoryRateUseCase);
    getPointTransitionUseCase = module.get(GetPointTransitionUseCase);
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

      getVictoryRateUseCase.execute.mockResolvedValue(mockVictoryRates);

      const result = await service.getVictoryRate(userId, request);

      expect(result).toEqual({ victoryRates: mockVictoryRates });
      expect(getVictoryRateUseCase.execute).toHaveBeenCalledWith(
        userId,
        [GroupByField.RULE, GroupByField.STAGE],
      );
    });

    it('should return empty victory rates when no data', async () => {
      const userId = 'test-user-id';
      const request: GetVictoryRateRequest = {
        groupBy: [GroupByField.WEAPON],
      };

      getVictoryRateUseCase.execute.mockResolvedValue([]);

      const result = await service.getVictoryRate(userId, request);

      expect(result).toEqual({ victoryRates: [] });
    });
  });

  describe('getPointTransition', () => {
    it('should return point transition data from use case', async () => {
      const userId = 'test-user-id';
      const request: GetPointTransitionRequest = {
        ruleId: 1,
      };

      const mockPoints = [
        { gameDateTime: new Date('2024-11-01T10:00:00Z'), point: 1500 },
        { gameDateTime: new Date('2024-11-02T10:00:00Z'), point: 1520 },
      ];

      getPointTransitionUseCase.execute.mockResolvedValue(mockPoints);

      const result = await service.getPointTransition(userId, request);

      expect(result).toEqual({
        points: [
          { gameDateTime: '2024-11-01T10:00:00.000Z', point: 1500 },
          { gameDateTime: '2024-11-02T10:00:00.000Z', point: 1520 },
        ],
      });
      expect(getPointTransitionUseCase.execute).toHaveBeenCalledWith(
        userId,
        1,
        undefined,
        undefined,
      );
    });

    it('should pass date range to use case when provided', async () => {
      const userId = 'test-user-id';
      const request: GetPointTransitionRequest = {
        ruleId: 1,
        startDate: '2024-11-01T00:00:00Z',
        endDate: '2024-11-30T23:59:59Z',
      };

      getPointTransitionUseCase.execute.mockResolvedValue([]);

      await service.getPointTransition(userId, request);

      expect(getPointTransitionUseCase.execute).toHaveBeenCalledWith(
        userId,
        1,
        new Date(2024, 10, 1, 0, 0, 0),
        new Date(2024, 10, 30, 23, 59, 59),
      );
    });

    it('should return empty points when no data', async () => {
      const userId = 'test-user-id';
      const request: GetPointTransitionRequest = {
        ruleId: 999,
      };

      getPointTransitionUseCase.execute.mockResolvedValue([]);

      const result = await service.getPointTransition(userId, request);

      expect(result).toEqual({ points: [] });
    });
  });
});
