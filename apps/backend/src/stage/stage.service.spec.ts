import { Test, TestingModule } from '@nestjs/testing';
import { StageService } from './stage.service';
import { StageRepository } from './stage.repository';
import { Stage } from 'generated/prisma/client';

describe('StageService', () => {
  let service: StageService;
  let stageRepository: jest.Mocked<StageRepository>;

  const mockStages: Stage[] = [
    { id: 1, name: 'Scorch Gorge' },
    { id: 2, name: 'Eeltail Alley' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StageService,
        {
          provide: StageRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StageService>(StageService);
    stageRepository = module.get(StageRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all stages', async () => {
      stageRepository.findAll.mockResolvedValue(mockStages);

      const result = await service.findAll();

      expect(result).toEqual({ stages: mockStages });
      expect(stageRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no stages exist', async () => {
      stageRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual({ stages: [] });
    });
  });
});
