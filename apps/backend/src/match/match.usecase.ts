import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MatchRepository, CreateMatchData } from './match.repository';
import { RuleRepository } from '../rule/rule.repository';
import { WeaponRepository } from '../weapon/weapon.repository';
import { StageRepository } from '../stage/stage.repository';
import { BattleTypeRepository } from '../battle-type/battle-type.repository';
import { MatchData } from './match.dto';
import { parseIsoStringAsLocalTime } from '../common/utils/date.util';

@Injectable()
export class MatchUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchRepository: MatchRepository,
    private readonly ruleRepository: RuleRepository,
    private readonly weaponRepository: WeaponRepository,
    private readonly stageRepository: StageRepository,
    private readonly battleTypeRepository: BattleTypeRepository,
  ) {}

  async bulkCreateMatches(
    userId: string,
    matches: MatchData[],
  ): Promise<void> {
    // Validate all matches before creating any
    await this.validateMatches(matches);

    // Prepare data for bulk insert
    const matchDataList: CreateMatchData[] = matches.map(
      ({ ruleId, weaponId, stageId, battleTypeId, result, gameDateTime, point }) => ({
        userId,
        ruleId,
        weaponId,
        stageId,
        battleTypeId,
        result,
        gameDateTime: parseIsoStringAsLocalTime(gameDateTime),
        point: point ?? null,
      }),
    );

    // Create all matches in a transaction
    await this.prisma.$transaction(async (tx) => {
      await this.matchRepository.createMany(matchDataList, tx);
    });
  }

  private async validateMatches(matches: MatchData[]): Promise<void> {
    // Collect all unique IDs to validate
    const ruleIds = Array.from(new Set(matches.map((m) => m.ruleId)));
    const weaponIds = Array.from(new Set(matches.map((m) => m.weaponId)));
    const stageIds = Array.from(new Set(matches.map((m) => m.stageId)));
    const battleTypeIds = Array.from(new Set(matches.map((m) => m.battleTypeId)));

    // Validate all IDs in parallel with bulk queries
    const [rules, weapons, stages, battleTypes] = await Promise.all([
      this.ruleRepository.findByIds(ruleIds),
      this.weaponRepository.findByIds(weaponIds),
      this.stageRepository.findByIds(stageIds),
      this.battleTypeRepository.findByIds(battleTypeIds),
    ]);

    // Check for invalid IDs
    const foundRuleIds = new Set(rules.map((r) => r.id));
    const foundWeaponIds = new Set(weapons.map((w) => w.id));
    const foundStageIds = new Set(stages.map((s) => s.id));
    const foundBattleTypeIds = new Set(battleTypes.map((b) => b.id));

    const invalidRules = ruleIds.filter((id) => !foundRuleIds.has(id));
    const invalidWeapons = weaponIds.filter((id) => !foundWeaponIds.has(id));
    const invalidStages = stageIds.filter((id) => !foundStageIds.has(id));
    const invalidBattleTypes = battleTypeIds.filter((id) => !foundBattleTypeIds.has(id));

    // Collect all validation errors
    const errors: string[] = [];
    if (invalidRules.length > 0) {
      errors.push(`Invalid rule IDs: ${invalidRules.join(', ')}`);
    }
    if (invalidWeapons.length > 0) {
      errors.push(`Invalid weapon IDs: ${invalidWeapons.join(', ')}`);
    }
    if (invalidStages.length > 0) {
      errors.push(`Invalid stage IDs: ${invalidStages.join(', ')}`);
    }
    if (invalidBattleTypes.length > 0) {
      errors.push(`Invalid battle type IDs: ${invalidBattleTypes.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('; '));
    }
  }
}
