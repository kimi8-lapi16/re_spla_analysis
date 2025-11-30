import { Injectable } from '@nestjs/common';
import { Stage as PrismaStage } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Stage } from './stage.entity';

@Injectable()
export class StageRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaStage: PrismaStage): Stage {
    return {
      id: prismaStage.id,
      name: prismaStage.name,
    };
  }

  async findById(id: number): Promise<Stage | null> {
    const prismaStage = await this.prisma.stage.findUnique({
      where: { id },
    });
    return prismaStage ? this.toDomain(prismaStage) : null;
  }

  async findByIds(ids: number[]): Promise<Stage[]> {
    const prismaStages = await this.prisma.stage.findMany({
      where: {
        id: { in: ids },
      },
    });
    return prismaStages.map((s) => this.toDomain(s));
  }

  async findAll(): Promise<Stage[]> {
    const prismaStages = await this.prisma.stage.findMany({
      orderBy: { id: 'asc' },
    });
    return prismaStages.map((s) => this.toDomain(s));
  }
}
