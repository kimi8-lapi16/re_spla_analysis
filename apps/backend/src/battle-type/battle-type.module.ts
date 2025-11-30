import { Module } from '@nestjs/common';
import { BattleTypeRepository } from './battle-type.repository';

@Module({
  providers: [BattleTypeRepository],
  exports: [BattleTypeRepository],
})
export class BattleTypeModule {}
