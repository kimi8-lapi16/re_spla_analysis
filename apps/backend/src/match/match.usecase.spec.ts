import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MatchUseCase } from './match.usecase';
import { MatchRepository } from './match.repository';
import { RuleRepository } from '../rule/rule.repository';
import { WeaponRepository } from '../weapon/weapon.repository';
import { StageRepository } from '../stage/stage.repository';
import { BattleTypeRepository } from '../battle-type/battle-type.repository';
import { PrismaService } from '../prisma/prisma.service';
import { MatchData, MatchResult } from './match.dto';
import { Rule, Weapon, Stage, BattleType } from 'generated/prisma/client';

type MockPrismaService = {
  $transaction: jest.Mock;
};

describe('MatchUseCase', () => {
  let useCase: MatchUseCase;
  let matchRepository: jest.Mocked<MatchRepository>;
  let ruleRepository: jest.Mocked<RuleRepository>;
  let weaponRepository: jest.Mocked<WeaponRepository>;
  let stageRepository: jest.Mocked<StageRepository>;
  let battleTypeRepository: jest.Mocked<BattleTypeRepository>;
  let prismaService: MockPrismaService;

  const mockRule: Rule = {
    id: 1,
    name: 'Turf War',
  };

  const mockWeapon: Weapon = {
    id: 1,
    name: 'Splattershot',
    subWeaponId: 1,
    specialWeaponId: 1,
  };

  const mockStage: Stage = {
    id: 1,
    name: 'Scorch Gorge',
  };

  const mockBattleType: BattleType = {
    id: 1,
    name: 'Regular Battle',
  };

  const mockMatchData: MatchData = {
    ruleId: 1,
    weaponId: 1,
    stageId: 1,
    battleTypeId: 1,
    result: MatchResult.WIN,
    gameDateTime: '2024-11-24T10:30:00Z',
    point: 1500,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchUseCase,
        {
          provide: MatchRepository,
          useValue: {
            createMany: jest.fn(),
          },
        },
        {
          provide: RuleRepository,
          useValue: {
            findByIds: jest.fn(),
          },
        },
        {
          provide: WeaponRepository,
          useValue: {
            findByIds: jest.fn(),
          },
        },
        {
          provide: StageRepository,
          useValue: {
            findByIds: jest.fn(),
          },
        },
        {
          provide: BattleTypeRepository,
          useValue: {
            findByIds: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<MatchUseCase>(MatchUseCase);
    matchRepository = module.get(MatchRepository);
    ruleRepository = module.get(RuleRepository);
    weaponRepository = module.get(WeaponRepository);
    stageRepository = module.get(StageRepository);
    battleTypeRepository = module.get(BattleTypeRepository);
    prismaService = module.get<MockPrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('bulkCreateMatches', () => {
    it('should successfully create multiple matches when all validations pass', async () => {
      const userId = 'test-user-id';
      const matches = [mockMatchData];

      ruleRepository.findByIds.mockResolvedValue([mockRule]);
      weaponRepository.findByIds.mockResolvedValue([mockWeapon]);
      stageRepository.findByIds.mockResolvedValue([mockStage]);
      battleTypeRepository.findByIds.mockResolvedValue([mockBattleType]);

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          match: {
            createMany: matchRepository.createMany,
          },
        });
      });

      await useCase.bulkCreateMatches(userId, matches);

      expect(ruleRepository.findByIds).toHaveBeenCalledWith([1]);
      expect(weaponRepository.findByIds).toHaveBeenCalledWith([1]);
      expect(stageRepository.findByIds).toHaveBeenCalledWith([1]);
      expect(battleTypeRepository.findByIds).toHaveBeenCalledWith([1]);
      expect(matchRepository.createMany).toHaveBeenCalledWith(
        [
          {
            userId,
            ruleId: 1,
            weaponId: 1,
            stageId: 1,
            battleTypeId: 1,
            result: MatchResult.WIN,
            gameDateTime: new Date('2024-11-24T10:30:00Z'),
            point: 1500,
          },
        ],
        expect.anything(),
      );
    });

    it('should throw BadRequestException when rule ID is invalid', async () => {
      const userId = 'test-user-id';
      const matches = [mockMatchData];

      ruleRepository.findByIds.mockResolvedValue([]);
      weaponRepository.findByIds.mockResolvedValue([mockWeapon]);
      stageRepository.findByIds.mockResolvedValue([mockStage]);
      battleTypeRepository.findByIds.mockResolvedValue([mockBattleType]);

      await expect(useCase.bulkCreateMatches(userId, matches)).rejects.toThrow(
        BadRequestException,
      );
      await expect(useCase.bulkCreateMatches(userId, matches)).rejects.toThrow(
        'Invalid rule IDs: 1',
      );
    });

    it('should throw BadRequestException when weapon ID is invalid', async () => {
      const userId = 'test-user-id';
      const matches = [mockMatchData];

      ruleRepository.findByIds.mockResolvedValue([mockRule]);
      weaponRepository.findByIds.mockResolvedValue([]);
      stageRepository.findByIds.mockResolvedValue([mockStage]);
      battleTypeRepository.findByIds.mockResolvedValue([mockBattleType]);

      await expect(useCase.bulkCreateMatches(userId, matches)).rejects.toThrow(
        BadRequestException,
      );
      await expect(useCase.bulkCreateMatches(userId, matches)).rejects.toThrow(
        'Invalid weapon IDs: 1',
      );
    });

    it('should throw BadRequestException when stage ID is invalid', async () => {
      const userId = 'test-user-id';
      const matches = [mockMatchData];

      ruleRepository.findByIds.mockResolvedValue([mockRule]);
      weaponRepository.findByIds.mockResolvedValue([mockWeapon]);
      stageRepository.findByIds.mockResolvedValue([]);
      battleTypeRepository.findByIds.mockResolvedValue([mockBattleType]);

      await expect(useCase.bulkCreateMatches(userId, matches)).rejects.toThrow(
        BadRequestException,
      );
      await expect(useCase.bulkCreateMatches(userId, matches)).rejects.toThrow(
        'Invalid stage IDs: 1',
      );
    });

    it('should throw BadRequestException when battle type ID is invalid', async () => {
      const userId = 'test-user-id';
      const matches = [mockMatchData];

      ruleRepository.findByIds.mockResolvedValue([mockRule]);
      weaponRepository.findByIds.mockResolvedValue([mockWeapon]);
      stageRepository.findByIds.mockResolvedValue([mockStage]);
      battleTypeRepository.findByIds.mockResolvedValue([]);

      await expect(useCase.bulkCreateMatches(userId, matches)).rejects.toThrow(
        BadRequestException,
      );
      await expect(useCase.bulkCreateMatches(userId, matches)).rejects.toThrow(
        'Invalid battle type IDs: 1',
      );
    });

    it('should throw BadRequestException with multiple errors when multiple IDs are invalid', async () => {
      const userId = 'test-user-id';
      const matches = [mockMatchData];

      ruleRepository.findByIds.mockResolvedValue([]);
      weaponRepository.findByIds.mockResolvedValue([]);
      stageRepository.findByIds.mockResolvedValue([mockStage]);
      battleTypeRepository.findByIds.mockResolvedValue([mockBattleType]);

      await expect(useCase.bulkCreateMatches(userId, matches)).rejects.toThrow(
        BadRequestException,
      );
      await expect(useCase.bulkCreateMatches(userId, matches)).rejects.toThrow(
        /Invalid rule IDs: 1.*Invalid weapon IDs: 1/,
      );
    });

    it('should validate multiple matches with different IDs', async () => {
      const userId = 'test-user-id';
      const matches = [
        mockMatchData,
        { ...mockMatchData, ruleId: 2, weaponId: 2 },
      ];

      ruleRepository.findByIds.mockResolvedValue([
        mockRule,
        { ...mockRule, id: 2, name: 'Splat Zones' },
      ]);
      weaponRepository.findByIds.mockResolvedValue([
        mockWeapon,
        { ...mockWeapon, id: 2, name: 'Splat Roller' },
      ]);
      stageRepository.findByIds.mockResolvedValue([mockStage]);
      battleTypeRepository.findByIds.mockResolvedValue([mockBattleType]);

      prismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          match: {
            createMany: matchRepository.createMany,
          },
        });
      });

      await useCase.bulkCreateMatches(userId, matches);

      expect(ruleRepository.findByIds).toHaveBeenCalledWith([1, 2]);
      expect(weaponRepository.findByIds).toHaveBeenCalledWith([1, 2]);
      expect(stageRepository.findByIds).toHaveBeenCalledWith([1]);
      expect(battleTypeRepository.findByIds).toHaveBeenCalledWith([1]);
    });
  });
});
