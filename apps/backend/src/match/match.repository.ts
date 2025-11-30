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
}
