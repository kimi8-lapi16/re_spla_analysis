import { Module } from '@nestjs/common';
import { BattleTypeRepository } from './battle-type.repository';
import { BattleTypeService } from './battle-type.service';
import { BattleTypeController } from './battle-type.controller';

@Module({
  controllers: [BattleTypeController],
  providers: [BattleTypeRepository, BattleTypeService],
  exports: [BattleTypeRepository],
})
export class BattleTypeModule {}
