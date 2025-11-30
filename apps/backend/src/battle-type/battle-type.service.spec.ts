import { Test, TestingModule } from '@nestjs/testing';
import { BattleTypeService } from './battle-type.service';
import { BattleTypeRepository } from './battle-type.repository';
import { BattleType } from 'generated/prisma/client';

describe('BattleTypeService', () => {
  let service: BattleTypeService;
  let battleTypeRepository: jest.Mocked<BattleTypeRepository>;

  const mockBattleTypes: BattleType[] = [
    { id: 1, name: 'Regular Battle' },
    { id: 2, name: 'Ranked Battle' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BattleTypeService,
        {
          provide: BattleTypeRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BattleTypeService>(BattleTypeService);
    battleTypeRepository = module.get(BattleTypeRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all battle types', async () => {
      battleTypeRepository.findAll.mockResolvedValue(mockBattleTypes);

      const result = await service.findAll();

      expect(result).toEqual({ battleTypes: mockBattleTypes });
      expect(battleTypeRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no battle types exist', async () => {
      battleTypeRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual({ battleTypes: [] });
    });
  });
});
