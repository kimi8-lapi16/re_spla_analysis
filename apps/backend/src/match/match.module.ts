import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { RuleModule } from '../rule/rule.module';
import { WeaponModule } from '../weapon/weapon.module';
import { StageModule } from '../stage/stage.module';
import { BattleTypeModule } from '../battle-type/battle-type.module';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { MatchRepository } from './match.repository';
import { MatchUseCase } from './match.usecase';

@Module({
  imports: [
    CommonModule,
    RuleModule,
    WeaponModule,
    StageModule,
    BattleTypeModule,
  ],
  controllers: [MatchController],
  providers: [MatchService, MatchRepository, MatchUseCase],
  exports: [MatchService],
})
export class MatchModule {}
