import { Test, TestingModule } from '@nestjs/testing';
import { WeaponService } from './weapon.service';
import { WeaponRepository } from './weapon.repository';
import { SubWeaponRepository } from './sub-weapon.repository';
import { SpecialWeaponRepository } from './special-weapon.repository';
import { Weapon, SubWeapon, SpecialWeapon } from 'generated/prisma/client';

describe('WeaponService', () => {
  let service: WeaponService;
  let weaponRepository: jest.Mocked<WeaponRepository>;
  let subWeaponRepository: jest.Mocked<SubWeaponRepository>;
  let specialWeaponRepository: jest.Mocked<SpecialWeaponRepository>;

  const mockWeapons: Weapon[] = [
    {
      id: 1,
      name: 'Splattershot',
      subWeaponId: 1,
      specialWeaponId: 1,
    },
    {
      id: 2,
      name: 'Splat Roller',
      subWeaponId: 2,
      specialWeaponId: 2,
    },
  ];

  const mockSubWeapons: SubWeapon[] = [
    { id: 1, name: 'Splat Bomb' },
    { id: 2, name: 'Curling Bomb' },
  ];

  const mockSpecialWeapons: SpecialWeapon[] = [
    { id: 1, name: 'Trizooka' },
    { id: 2, name: 'Big Bubbler' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeaponService,
        {
          provide: WeaponRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: SubWeaponRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
        {
          provide: SpecialWeaponRepository,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WeaponService>(WeaponService);
    weaponRepository = module.get(WeaponRepository);
    subWeaponRepository = module.get(SubWeaponRepository);
    specialWeaponRepository = module.get(SpecialWeaponRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all weapons with sub and special weapons', async () => {
      weaponRepository.findAll.mockResolvedValue(mockWeapons);
      subWeaponRepository.findAll.mockResolvedValue(mockSubWeapons);
      specialWeaponRepository.findAll.mockResolvedValue(mockSpecialWeapons);

      const result = await service.findAll();

      expect(result).toEqual({
        weapons: [
          {
            id: 1,
            name: 'Splattershot',
            subWeaponId: 1,
            specialWeaponId: 1,
            subWeapon: { id: 1, name: 'Splat Bomb' },
            specialWeapon: { id: 1, name: 'Trizooka' },
          },
          {
            id: 2,
            name: 'Splat Roller',
            subWeaponId: 2,
            specialWeaponId: 2,
            subWeapon: { id: 2, name: 'Curling Bomb' },
            specialWeapon: { id: 2, name: 'Big Bubbler' },
          },
        ],
      });

      expect(weaponRepository.findAll).toHaveBeenCalledTimes(1);
      expect(subWeaponRepository.findAll).toHaveBeenCalledTimes(1);
      expect(specialWeaponRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw error if sub weapon is missing', async () => {
      weaponRepository.findAll.mockResolvedValue(mockWeapons);
      subWeaponRepository.findAll.mockResolvedValue([]); // Empty
      specialWeaponRepository.findAll.mockResolvedValue(mockSpecialWeapons);

      await expect(service.findAll()).rejects.toThrow(
        'Missing related weapon data for weapon ID 1',
      );
    });

    it('should throw error if special weapon is missing', async () => {
      weaponRepository.findAll.mockResolvedValue(mockWeapons);
      subWeaponRepository.findAll.mockResolvedValue(mockSubWeapons);
      specialWeaponRepository.findAll.mockResolvedValue([]); // Empty

      await expect(service.findAll()).rejects.toThrow(
        'Missing related weapon data for weapon ID 1',
      );
    });

    it('should return empty array when no weapons exist', async () => {
      weaponRepository.findAll.mockResolvedValue([]);
      subWeaponRepository.findAll.mockResolvedValue(mockSubWeapons);
      specialWeaponRepository.findAll.mockResolvedValue(mockSpecialWeapons);

      const result = await service.findAll();

      expect(result).toEqual({ weapons: [] });
    });
  });
});
