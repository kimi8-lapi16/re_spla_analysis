import { Injectable } from '@nestjs/common';
import { Match as PrismaMatch } from 'generated/prisma/client';
import { PrismaTransaction } from 'src/prisma/prisma.types';
import { PrismaService } from '../prisma/prisma.service';
import { Match } from './match.entity';

export interface CreateMatchData {
  userId: string;
  ruleId: number;
  weaponId: number;
  stageId: number;
  battleTypeId: number;
  result: string;
  gameDateTime: Date;
  point: number | null;
}

@Injectable()
export class MatchRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaMatch: PrismaMatch): Match {
    return {
      id: prismaMatch.id,
      result: prismaMatch.result,
      battleTypeId: prismaMatch.battleTypeId,
      stageId: prismaMatch.stageId,
      ruleId: prismaMatch.ruleId,
      weaponId: prismaMatch.weaponId,
      gameDateTime: prismaMatch.gameDateTime,
      point: prismaMatch.point,
      userId: prismaMatch.userId,
    };
  }

  async createMany(
    dataList: CreateMatchData[],
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.match.createMany({
      data: dataList,
    });
  }

  async findById(id: string): Promise<Match | null> {
    const prismaMatch = await this.prisma.match.findUnique({
      where: { id },
    });
    return prismaMatch ? this.toDomain(prismaMatch) : null;
  }

  async findByUserId(userId: string): Promise<Match[]> {
    const prismaMatches = await this.prisma.match.findMany({
      where: { userId },
      orderBy: { gameDateTime: 'desc' },
    });
    return prismaMatches.map((m) => this.toDomain(m));
  }

  async searchMatches(params: {
    userId: string;
    weaponIds?: number[];
    stageIds?: number[];
    ruleIds?: number[];
    battleTypeIds?: number[];
    results?: string[];
    startDateTime?: Date;
    endDateTime?: Date;
    operator: 'AND' | 'OR';
    skip: number;
    take: number;
  }): Promise<{ matches: Match[]; total: number }> {
    const {
      userId,
      weaponIds,
      stageIds,
      ruleIds,
      battleTypeIds,
      results,
      startDateTime,
      endDateTime,
      operator,
      skip,
      take,
    } = params;

    const conditions: Array<Record<string, unknown>> = [];

    if (weaponIds && weaponIds.length > 0) {
      conditions.push({ weaponId: { in: weaponIds } });
    }
    if (stageIds && stageIds.length > 0) {
      conditions.push({ stageId: { in: stageIds } });
    }
    if (ruleIds && ruleIds.length > 0) {
      conditions.push({ ruleId: { in: ruleIds } });
    }
    if (battleTypeIds && battleTypeIds.length > 0) {
      conditions.push({ battleTypeId: { in: battleTypeIds } });
    }
    if (results && results.length > 0) {
      conditions.push({ result: { in: results } });
    }
    if (startDateTime) {
      conditions.push({ gameDateTime: { gte: startDateTime } });
    }
    if (endDateTime) {
      conditions.push({ gameDateTime: { lte: endDateTime } });
    }

    const where =
      conditions.length === 0
        ? { userId }
        : operator === 'AND'
          ? { AND: [{ userId }, ...conditions] }
          : { AND: [{ userId }, { OR: conditions }] };

    const [prismaMatches, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        orderBy: { gameDateTime: 'desc' },
        skip,
        take,
      }),
      this.prisma.match.count({ where }),
    ]);

    return {
      matches: prismaMatches.map((m) => this.toDomain(m)),
      total,
    };
  }
}
