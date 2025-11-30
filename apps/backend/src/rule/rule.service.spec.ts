import { Test, TestingModule } from '@nestjs/testing';
import { RuleService } from './rule.service';
import { RuleRepository } from './rule.repository';
import { Rule } from 'generated/prisma/client';

describe('RuleService', () => {
  let service: RuleService;
  let ruleRepository: jest.Mocked<RuleRepository>;

  const mockRules: Rule[] = [
    { id: 1, name: 'Turf War' },
    { id: 2, name: 'Splat Zones' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuleService,
        {
          provide: RuleRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RuleService>(RuleService);
    ruleRepository = module.get(RuleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all rules', async () => {
      ruleRepository.findAll.mockResolvedValue(mockRules);

      const result = await service.findAll();

      expect(result).toEqual({ rules: mockRules });
      expect(ruleRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no rules exist', async () => {
      ruleRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual({ rules: [] });
    });
  });
});
