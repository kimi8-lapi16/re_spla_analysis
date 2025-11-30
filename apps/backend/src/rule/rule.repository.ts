import { Injectable } from '@nestjs/common';
import { Rule } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Rule | null> {
    return this.prisma.rule.findUnique({
      where: { id },
    });
  }

  async findByIds(ids: number[]): Promise<Rule[]> {
    return this.prisma.rule.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async findAll(): Promise<Rule[]> {
    return this.prisma.rule.findMany();
  }
}
