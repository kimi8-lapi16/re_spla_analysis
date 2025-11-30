import { ApiProperty } from '@nestjs/swagger';

export class SubWeaponResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Splat Bomb' })
  name: string;
}

export class SpecialWeaponResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Trizooka' })
  name: string;
}

export class WeaponResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Splattershot' })
  name: string;

  @ApiProperty({ example: 1 })
  subWeaponId: number;

  @ApiProperty({ example: 1 })
  specialWeaponId: number;

  @ApiProperty({ type: SubWeaponResponse })
  subWeapon: SubWeaponResponse;

  @ApiProperty({ type: SpecialWeaponResponse })
  specialWeapon: SpecialWeaponResponse;
}

export class GetWeaponsResponse {
  @ApiProperty({ type: [WeaponResponse] })
  weapons: WeaponResponse[];
}
