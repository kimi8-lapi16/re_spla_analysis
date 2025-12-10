import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  GroupByField,
  VictoryRateSortBy,
  SortOrder,
  VictoryRateResult,
  PointTransitionResult,
} from './analysis.dto';

type VictoryRateRawResult = {
  rule_name?: string;
  stage_name?: string;
  weapon_name?: string;
  battle_type_name?: string;
  total_count: bigint;
  win_count: bigint;
};

type VictoryRateCountResult = {
  count: bigint;
};

export interface GetVictoryRateParams {
  userId: string;
  groupBy: GroupByField[];
  sortBy?: VictoryRateSortBy;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface GetVictoryRateResult {
  victoryRates: VictoryRateResult[];
  total: number;
}

@Injectable()
export class AnalysisUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async getVictoryRate(
    params: GetVictoryRateParams,
  ): Promise<GetVictoryRateResult> {
    const {
      userId,
      groupBy,
      sortBy = VictoryRateSortBy.VICTORY_RATE,
      sortOrder = SortOrder.DESC,
      page = 1,
      pageSize = 20,
    } = params;

    const { selectColumns, joinClauses, groupColumns } =
      this.buildVictoryRateQueryParts(groupBy);

    const orderByColumn = this.buildOrderByColumn(sortBy);
    const orderDirection = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';
    const offset = (page - 1) * pageSize;

    // Main query with ORDER BY, LIMIT, OFFSET
    const query = Prisma.sql`
      SELECT
        ${Prisma.raw(selectColumns.join(', '))},
        COUNT(*) AS total_count,
        SUM(match.result = 'WIN') AS win_count
      FROM \`match\`
      ${Prisma.raw(joinClauses.join(' '))}
      WHERE match.user_id = ${userId}
      GROUP BY ${Prisma.raw(groupColumns.join(', '))}
      ORDER BY ${Prisma.raw(orderByColumn)} ${Prisma.raw(orderDirection)}
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    // Count query for total
    const countQuery = Prisma.sql`
      SELECT COUNT(*) AS count FROM (
        SELECT 1
        FROM \`match\`
        ${Prisma.raw(joinClauses.join(' '))}
        WHERE match.user_id = ${userId}
        GROUP BY ${Prisma.raw(groupColumns.join(', '))}
      ) AS subquery
    `;

    const [results, countResults] = await Promise.all([
      this.prisma.$queryRaw<VictoryRateRawResult[]>(query),
      this.prisma.$queryRaw<VictoryRateCountResult[]>(countQuery),
    ]);

    const total = Number(countResults[0]?.count ?? 0);

    const victoryRates = results.map((row) => {
      const totalCount = Number(row.total_count);
      const winCount = Number(row.win_count);
      return {
        ruleName: row.rule_name,
        stageName: row.stage_name,
        weaponName: row.weapon_name,
        battleTypeName: row.battle_type_name,
        totalCount,
        winCount,
        victoryRate: totalCount > 0 ? winCount / totalCount : 0,
      };
    });

    return { victoryRates, total };
  }

  private buildOrderByColumn(sortBy: VictoryRateSortBy): string {
    switch (sortBy) {
      case VictoryRateSortBy.VICTORY_RATE:
        return 'win_count / total_count';
      case VictoryRateSortBy.TOTAL_COUNT:
        return 'total_count';
      case VictoryRateSortBy.WIN_COUNT:
        return 'win_count';
      case VictoryRateSortBy.RULE_NAME:
        return 'rule_name';
      case VictoryRateSortBy.STAGE_NAME:
        return 'stage_name';
      case VictoryRateSortBy.WEAPON_NAME:
        return 'weapon_name';
      case VictoryRateSortBy.BATTLE_TYPE_NAME:
        return 'battle_type_name';
      default:
        return 'win_count / total_count';
    }
  }

  async getPointTransition(
    userId: string,
    ruleId: number,
    battleTypeId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<PointTransitionResult[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        userId,
        ruleId,
        battleTypeId,
        point: { not: null },
        gameDateTime: this.buildDateTimeFilter(startDate, endDate),
      },
      select: {
        gameDateTime: true,
        point: true,
      },
      orderBy: {
        gameDateTime: 'asc',
      },
    });

    // point: { not: null } でフィルタ済みのため、point は必ず存在する
    return matches.map((m) => ({
      gameDateTime: m.gameDateTime,
      point: m.point!,
    }));
  }

  private buildVictoryRateQueryParts(groupBy: GroupByField[]): {
    selectColumns: string[];
    joinClauses: string[];
    groupColumns: string[];
  } {
    const selectColumns: string[] = [];
    const joinClauses: string[] = [];
    const groupColumns: string[] = [];

    if (groupBy.includes(GroupByField.RULE)) {
      groupColumns.push('match.rule_id');
      selectColumns.push('rule.name AS rule_name');
      joinClauses.push('INNER JOIN rule ON match.rule_id = rule.id');
    }

    if (groupBy.includes(GroupByField.STAGE)) {
      groupColumns.push('match.stage_id');
      selectColumns.push('stage.name AS stage_name');
      joinClauses.push('INNER JOIN stage ON match.stage_id = stage.id');
    }

    if (groupBy.includes(GroupByField.WEAPON)) {
      groupColumns.push('match.weapon_id');
      selectColumns.push('weapon.name AS weapon_name');
      joinClauses.push('INNER JOIN weapon ON match.weapon_id = weapon.id');
    }

    if (groupBy.includes(GroupByField.BATTLE_TYPE)) {
      groupColumns.push('match.battle_type_id');
      selectColumns.push('battle_type.name AS battle_type_name');
      joinClauses.push(
        'INNER JOIN battle_type ON match.battle_type_id = battle_type.id',
      );
    }

    return { selectColumns, joinClauses, groupColumns };
  }

  private buildDateTimeFilter(
    startDate?: Date,
    endDate?: Date,
  ): { gte?: Date; lte?: Date } | undefined {
    if (!startDate && !endDate) {
      return undefined;
    }
    const filter: { gte?: Date; lte?: Date } = {};
    if (startDate) {
      filter.gte = startDate;
    }
    if (endDate) {
      filter.lte = endDate;
    }
    return filter;
  }
}
