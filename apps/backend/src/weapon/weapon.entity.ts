import { ApiProperty } from '@nestjs/swagger';

export class SubWeapon {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: 'Splat Bomb', type: String })
  name: string;
}

export class SpecialWeapon {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: 'Trizooka', type: String })
  name: string;
}

export class Weapon {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: 'Splattershot', type: String })
  name: string;

  @ApiProperty({ example: 1, type: Number })
  subWeaponId: number;

  @ApiProperty({ example: 1, type: Number })
  specialWeaponId: number;
}
