import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchUseCase } from './match.usecase';
import { MatchRepository } from './match.repository';
import {
  SearchMatchesRequest,
  SearchOperator,
  MatchResult,
  BulkUpdateMatchesRequest,
  BulkDeleteMatchesRequest,
} from './match.dto';
import { Match } from './match.entity';

describe('MatchService', () => {
  let service: MatchService;
  let matchRepository: jest.Mocked<MatchRepository>;
  let matchUseCase: jest.Mocked<MatchUseCase>;

  const mockMatch: Match = {
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
        MatchService,
        {
          provide: MatchUseCase,
          useValue: {
            bulkCreateMatches: jest.fn(),
            bulkUpdateMatches: jest.fn(),
          },
        },
        {
          provide: MatchRepository,
          useValue: {
            searchMatches: jest.fn(),
            findByUserIdAndIds: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    matchRepository = module.get(MatchRepository);
    matchUseCase = module.get(MatchUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchMatches', () => {
    it('should return search results with matches and total', async () => {
      const userId = 'test-user-id';
      const request: SearchMatchesRequest = {
        operator: SearchOperator.AND,
        page: 1,
        pageCount: 50,
      };

      matchRepository.searchMatches.mockResolvedValue({
        matches: [mockMatch],
        total: 1,
      });

      const result = await service.searchMatches(userId, request);

      expect(result).toEqual({
        matches: [
          {
            id: 'test-match-id',
            weaponId: 1,
            stageId: 2,
            ruleId: 3,
            battleTypeId: 4,
            result: 'WIN',
            gameDateTime: new Date('2024-11-24T10:30:00Z'),
            point: 1500,
          },
        ],
        total: 1,
      });
      expect(matchRepository.searchMatches).toHaveBeenCalledWith({
        userId,
        weaponIds: undefined,
        stageIds: undefined,
        ruleIds: undefined,
        battleTypeIds: undefined,
        results: undefined,
        startDateTime: undefined,
        endDateTime: undefined,
        operator: SearchOperator.AND,
        skip: 0,
        take: 50,
      });
    });

    it('should calculate skip and take correctly for pagination', async () => {
      const userId = 'test-user-id';
      const request: SearchMatchesRequest = {
        operator: SearchOperator.AND,
        page: 2,
        pageCount: 25,
      };

      matchRepository.searchMatches.mockResolvedValue({
        matches: [],
        total: 100,
      });

      await service.searchMatches(userId, request);

      expect(matchRepository.searchMatches).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 25,
          take: 25,
        }),
      );
    });

    it('should pass all filters to repository', async () => {
      const userId = 'test-user-id';
      const request: SearchMatchesRequest = {
        weapons: [1, 2],
        stages: [3, 4],
        rules: [1],
        battleTypes: [1],
        results: [MatchResult.WIN],
        startDateTime: '2024-11-01T00:00:00Z',
        endDateTime: '2024-11-30T23:59:59Z',
        operator: SearchOperator.AND,
        page: 1,
        pageCount: 50,
      };

      matchRepository.searchMatches.mockResolvedValue({
        matches: [mockMatch],
        total: 1,
      });

      await service.searchMatches(userId, request);

      expect(matchRepository.searchMatches).toHaveBeenCalledWith({
        userId,
        weaponIds: [1, 2],
        stageIds: [3, 4],
        ruleIds: [1],
        battleTypeIds: [1],
        results: [MatchResult.WIN],
        startDateTime: new Date(2024, 10, 1, 0, 0, 0),
        endDateTime: new Date(2024, 10, 30, 23, 59, 59),
        operator: SearchOperator.AND,
        skip: 0,
        take: 50,
      });
    });

    it('should use OR operator when specified', async () => {
      const userId = 'test-user-id';
      const request: SearchMatchesRequest = {
        weapons: [1, 2],
        stages: [3, 4],
        operator: SearchOperator.OR,
        page: 1,
        pageCount: 50,
      };

      matchRepository.searchMatches.mockResolvedValue({
        matches: [mockMatch],
        total: 5,
      });

      await service.searchMatches(userId, request);

      expect(matchRepository.searchMatches).toHaveBeenCalledWith(
        expect.objectContaining({
          operator: SearchOperator.OR,
        }),
      );
    });

    it('should return empty matches when no results found', async () => {
      const userId = 'test-user-id';
      const request: SearchMatchesRequest = {
        weapons: [999],
        operator: SearchOperator.AND,
        page: 1,
        pageCount: 50,
      };

      matchRepository.searchMatches.mockResolvedValue({
        matches: [],
        total: 0,
      });

      const result = await service.searchMatches(userId, request);

      expect(result).toEqual({
        matches: [],
        total: 0,
      });
    });

    it('should not include userId in response matches', async () => {
      const userId = 'test-user-id';
      const request: SearchMatchesRequest = {
        operator: SearchOperator.AND,
        page: 1,
        pageCount: 50,
      };

      matchRepository.searchMatches.mockResolvedValue({
        matches: [mockMatch],
        total: 1,
      });

      const result = await service.searchMatches(userId, request);

      expect(result.matches[0]).not.toHaveProperty('userId');
    });

    it('should handle null point values', async () => {
      const userId = 'test-user-id';
      const request: SearchMatchesRequest = {
        operator: SearchOperator.AND,
        page: 1,
        pageCount: 50,
      };

      const matchWithNullPoint: Match = {
        ...mockMatch,
        point: null,
      };

      matchRepository.searchMatches.mockResolvedValue({
        matches: [matchWithNullPoint],
        total: 1,
      });

      const result = await service.searchMatches(userId, request);

      expect(result.matches[0].point).toBeNull();
    });

    it('should handle multiple matches in response', async () => {
      const userId = 'test-user-id';
      const request: SearchMatchesRequest = {
        operator: SearchOperator.AND,
        page: 1,
        pageCount: 50,
      };

      const match2: Match = {
        ...mockMatch,
        id: 'test-match-id-2',
        result: 'LOSE',
        point: null,
      };

      matchRepository.searchMatches.mockResolvedValue({
        matches: [mockMatch, match2],
        total: 2,
      });

      const result = await service.searchMatches(userId, request);

      expect(result.matches).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.matches[0].id).toBe('test-match-id');
      expect(result.matches[1].id).toBe('test-match-id-2');
    });
  });

  describe('bulkUpdateMatches', () => {
    it('should verify ownership and call useCase.bulkUpdateMatches', async () => {
      const userId = 'test-user-id';
      const request: BulkUpdateMatchesRequest = {
        matches: [
          {
            id: 'match-1',
            ruleId: 1,
            weaponId: 1,
            stageId: 1,
            battleTypeId: 1,
            result: MatchResult.WIN,
            gameDateTime: '2024-11-24T10:30:00Z',
            point: 1500,
          },
        ],
      };

      matchRepository.findByUserIdAndIds.mockResolvedValue([mockMatch]);
      matchUseCase.bulkUpdateMatches.mockResolvedValue(undefined);

      const result = await service.bulkUpdateMatches(userId, request);

      expect(matchRepository.findByUserIdAndIds).toHaveBeenCalledWith(userId, ['match-1']);
      expect(matchUseCase.bulkUpdateMatches).toHaveBeenCalledWith(request.matches);
      expect(result).toEqual({ success: true });
    });

    it('should throw ForbiddenException when user does not own all matches', async () => {
      const userId = 'test-user-id';
      const request: BulkUpdateMatchesRequest = {
        matches: [
          {
            id: 'match-1',
            ruleId: 1,
            weaponId: 1,
            stageId: 1,
            battleTypeId: 1,
            result: MatchResult.WIN,
            gameDateTime: '2024-11-24T10:30:00Z',
          },
          {
            id: 'match-2',
            ruleId: 1,
            weaponId: 1,
            stageId: 1,
            battleTypeId: 1,
            result: MatchResult.LOSE,
            gameDateTime: '2024-11-24T11:30:00Z',
          },
        ],
      };

      // User only owns match-1, not match-2
      matchRepository.findByUserIdAndIds.mockResolvedValue([mockMatch]);

      await expect(service.bulkUpdateMatches(userId, request)).rejects.toThrow(ForbiddenException);
      expect(matchUseCase.bulkUpdateMatches).not.toHaveBeenCalled();
    });

    it('should propagate errors from useCase', async () => {
      const userId = 'test-user-id';
      const request: BulkUpdateMatchesRequest = {
        matches: [
          {
            id: 'match-1',
            ruleId: 1,
            weaponId: 1,
            stageId: 1,
            battleTypeId: 1,
            result: MatchResult.WIN,
            gameDateTime: '2024-11-24T10:30:00Z',
          },
        ],
      };

      matchRepository.findByUserIdAndIds.mockResolvedValue([mockMatch]);
      matchUseCase.bulkUpdateMatches.mockRejectedValue(new Error('Test error'));

      await expect(service.bulkUpdateMatches(userId, request)).rejects.toThrow('Test error');
    });
  });

  describe('bulkDeleteMatches', () => {
    it('should verify ownership and call repository.deleteMany', async () => {
      const userId = 'test-user-id';
      const request: BulkDeleteMatchesRequest = {
        ids: ['match-1', 'match-2'],
      };

      const match2: Match = { ...mockMatch, id: 'match-2' };
      matchRepository.findByUserIdAndIds.mockResolvedValue([mockMatch, match2]);
      matchRepository.deleteMany.mockResolvedValue(undefined);

      const result = await service.bulkDeleteMatches(userId, request);

      expect(matchRepository.findByUserIdAndIds).toHaveBeenCalledWith(userId, ['match-1', 'match-2']);
      expect(matchRepository.deleteMany).toHaveBeenCalledWith(userId, request.ids);
      expect(result).toEqual({ success: true });
    });

    it('should throw ForbiddenException when user does not own all matches', async () => {
      const userId = 'test-user-id';
      const request: BulkDeleteMatchesRequest = {
        ids: ['match-1', 'match-2'],
      };

      // User only owns match-1, not match-2
      matchRepository.findByUserIdAndIds.mockResolvedValue([mockMatch]);

      await expect(service.bulkDeleteMatches(userId, request)).rejects.toThrow(ForbiddenException);
      expect(matchRepository.deleteMany).not.toHaveBeenCalled();
    });

    it('should propagate errors from repository', async () => {
      const userId = 'test-user-id';
      const request: BulkDeleteMatchesRequest = {
        ids: ['match-1'],
      };

      matchRepository.findByUserIdAndIds.mockResolvedValue([mockMatch]);
      matchRepository.deleteMany.mockRejectedValue(new Error('Test error'));

      await expect(service.bulkDeleteMatches(userId, request)).rejects.toThrow('Test error');
    });
  });
});
