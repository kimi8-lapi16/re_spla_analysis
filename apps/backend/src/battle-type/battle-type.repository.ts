import { Injectable } from '@nestjs/common';
import { BattleType } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BattleTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<BattleType | null> {
    return this.prisma.battleType.findUnique({
      where: { id },
    });
  }

  async findByIds(ids: number[]): Promise<BattleType[]> {
    return this.prisma.battleType.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async findAll(): Promise<BattleType[]> {
    return this.prisma.battleType.findMany();
  }
}
