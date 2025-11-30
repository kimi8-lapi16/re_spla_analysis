import { Injectable } from '@nestjs/common';
import { Rule as PrismaRule } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Rule } from './rule.entity';

@Injectable()
export class RuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaRule: PrismaRule): Rule {
    return {
      id: prismaRule.id,
      name: prismaRule.name,
    };
  }

  async findById(id: number): Promise<Rule | null> {
    const prismaRule = await this.prisma.rule.findUnique({
      where: { id },
    });
    return prismaRule ? this.toDomain(prismaRule) : null;
  }

  async findByIds(ids: number[]): Promise<Rule[]> {
    const prismaRules = await this.prisma.rule.findMany({
      where: {
        id: { in: ids },
      },
    });
    return prismaRules.map((r) => this.toDomain(r));
  }

  async findAll(): Promise<Rule[]> {
    const prismaRules = await this.prisma.rule.findMany({
      orderBy: { id: 'asc' },
    });
    return prismaRules.map((r) => this.toDomain(r));
  }
}
