import { Injectable } from '@nestjs/common';
import { Stage } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Stage | null> {
    return this.prisma.stage.findUnique({
      where: { id },
    });
  }

  async findByIds(ids: number[]): Promise<Stage[]> {
    return this.prisma.stage.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async findAll(): Promise<Stage[]> {
    return this.prisma.stage.findMany();
  }
}
