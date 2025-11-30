import { Module } from '@nestjs/common';
import { WeaponRepository } from './weapon.repository';

@Module({
  providers: [WeaponRepository],
  exports: [WeaponRepository],
})
export class WeaponModule {}
