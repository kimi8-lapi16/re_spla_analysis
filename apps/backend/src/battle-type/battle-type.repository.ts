import { Injectable } from '@nestjs/common';
import { BattleType as PrismaBattleType } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BattleType } from './battle-type.entity';

@Injectable()
export class BattleTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaBattleType: PrismaBattleType): BattleType {
    return {
      id: prismaBattleType.id,
      name: prismaBattleType.name,
    };
  }

  async findById(id: number): Promise<BattleType | null> {
    const prismaBattleType = await this.prisma.battleType.findUnique({
      where: { id },
    });
    return prismaBattleType ? this.toDomain(prismaBattleType) : null;
  }

  async findByIds(ids: number[]): Promise<BattleType[]> {
    const prismaBattleTypes = await this.prisma.battleType.findMany({
      where: {
        id: { in: ids },
      },
    });
    return prismaBattleTypes.map((b) => this.toDomain(b));
  }

  async findAll(): Promise<BattleType[]> {
    const prismaBattleTypes = await this.prisma.battleType.findMany({
      orderBy: { id: 'asc' },
    });
    return prismaBattleTypes.map((b) => this.toDomain(b));
  }
}
