import { Module } from '@nestjs/common';
import { WeaponRepository } from './weapon.repository';
import { SubWeaponRepository } from './sub-weapon.repository';
import { SpecialWeaponRepository } from './special-weapon.repository';
import { WeaponService } from './weapon.service';
import { WeaponController } from './weapon.controller';

@Module({
  controllers: [WeaponController],
  providers: [
    WeaponRepository,
    SubWeaponRepository,
    SpecialWeaponRepository,
    WeaponService,
  ],
  exports: [WeaponRepository],
})
export class WeaponModule {}
