import { Injectable } from '@nestjs/common';
import { SpecialWeapon as PrismaSpecialWeapon } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SpecialWeapon } from './weapon.entity';

@Injectable()
export class SpecialWeaponRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaSpecialWeapon: PrismaSpecialWeapon): SpecialWeapon {
    return {
      id: prismaSpecialWeapon.id,
      name: prismaSpecialWeapon.name,
    };
  }

  async findAll(): Promise<SpecialWeapon[]> {
    const prismaSpecialWeapons = await this.prisma.specialWeapon.findMany({
      orderBy: { id: 'asc' },
    });
    return prismaSpecialWeapons.map((spw) => this.toDomain(spw));
  }

  async findByIds(ids: number[]): Promise<SpecialWeapon[]> {
    const prismaSpecialWeapons = await this.prisma.specialWeapon.findMany({
      where: {
        id: { in: ids },
      },
    });
    return prismaSpecialWeapons.map((spw) => this.toDomain(spw));
  }
}
