import { Injectable } from '@nestjs/common';
import { WeaponRepository } from './weapon.repository';
import { SubWeaponRepository } from './sub-weapon.repository';
import { SpecialWeaponRepository } from './special-weapon.repository';
import { GetWeaponsResponse, WeaponResponse } from './weapon.dto';

@Injectable()
export class WeaponService {
  constructor(
    private readonly weaponRepository: WeaponRepository,
    private readonly subWeaponRepository: SubWeaponRepository,
    private readonly specialWeaponRepository: SpecialWeaponRepository,
  ) {}

  async findAll(): Promise<GetWeaponsResponse> {
    // Fetch all data in parallel
    const [weapons, subWeapons, specialWeapons] = await Promise.all([
      this.weaponRepository.findAll(),
      this.subWeaponRepository.findAll(),
      this.specialWeaponRepository.findAll(),
    ]);

    // Create maps for O(1) lookup
    const subWeaponMap = new Map(subWeapons.map((sw) => [sw.id, sw]));
    const specialWeaponMap = new Map(
      specialWeapons.map((spw) => [spw.id, spw]),
    );

    // Combine data
    const weaponResponses: WeaponResponse[] = weapons.map((weapon) => {
      const subWeapon = subWeaponMap.get(weapon.subWeaponId);
      const specialWeapon = specialWeaponMap.get(weapon.specialWeaponId);

      if (!subWeapon || !specialWeapon) {
        throw new Error(
          `Missing related weapon data for weapon ID ${weapon.id}`,
        );
      }

      return {
        id: weapon.id,
        name: weapon.name,
        subWeaponId: weapon.subWeaponId,
        specialWeaponId: weapon.specialWeaponId,
        subWeapon: {
          id: subWeapon.id,
          name: subWeapon.name,
        },
        specialWeapon: {
          id: specialWeapon.id,
          name: specialWeapon.name,
        },
      };
    });

    return { weapons: weaponResponses };
  }
}
