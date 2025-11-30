import { Injectable } from '@nestjs/common';
import { SubWeapon as PrismaSubWeapon } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubWeapon } from './weapon.entity';

@Injectable()
export class SubWeaponRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaSubWeapon: PrismaSubWeapon): SubWeapon {
    return {
      id: prismaSubWeapon.id,
      name: prismaSubWeapon.name,
    };
  }

  async findAll(): Promise<SubWeapon[]> {
    const prismaSubWeapons = await this.prisma.subWeapon.findMany({
      orderBy: { id: 'asc' },
    });
    return prismaSubWeapons.map((sw) => this.toDomain(sw));
  }

  async findByIds(ids: number[]): Promise<SubWeapon[]> {
    const prismaSubWeapons = await this.prisma.subWeapon.findMany({
      where: {
        id: { in: ids },
      },
    });
    return prismaSubWeapons.map((sw) => this.toDomain(sw));
  }
}
