import { Injectable } from '@nestjs/common';
import { Match } from 'generated/prisma/client';
import { PrismaTransaction } from 'src/prisma/prisma.types';
import { PrismaService } from '../prisma/prisma.service';

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
    return this.prisma.match.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Match[]> {
    return this.prisma.match.findMany({
      where: { userId },
      orderBy: { gameDateTime: 'desc' },
    });
  }
}
