import { ApiProperty } from '@nestjs/swagger';
import { SubWeapon, SpecialWeapon } from './weapon.entity';

export class WeaponResponse {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: 'Splattershot', type: String })
  name: string;

  @ApiProperty({ example: 1, type: Number })
  subWeaponId: number;

  @ApiProperty({ example: 1, type: Number })
  specialWeaponId: number;

  @ApiProperty({ type: () => SubWeapon })
  subWeapon: SubWeapon;

  @ApiProperty({ type: () => SpecialWeapon })
  specialWeapon: SpecialWeapon;
}

export class GetWeaponsResponse {
  @ApiProperty({ type: [WeaponResponse] })
  weapons: WeaponResponse[];
}
