import { Injectable } from '@nestjs/common';
import { Weapon as PrismaWeapon } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Weapon } from './weapon.entity';

@Injectable()
export class WeaponRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaWeapon: PrismaWeapon): Weapon {
    return {
      id: prismaWeapon.id,
      name: prismaWeapon.name,
      subWeaponId: prismaWeapon.subWeaponId,
      specialWeaponId: prismaWeapon.specialWeaponId,
    };
  }

  async findById(id: number): Promise<Weapon | null> {
    const prismaWeapon = await this.prisma.weapon.findUnique({
      where: { id },
    });
    return prismaWeapon ? this.toDomain(prismaWeapon) : null;
  }

  async findByIds(ids: number[]): Promise<Weapon[]> {
    const prismaWeapons = await this.prisma.weapon.findMany({
      where: {
        id: { in: ids },
      },
    });
    return prismaWeapons.map((w) => this.toDomain(w));
  }

  async findAll(): Promise<Weapon[]> {
    const prismaWeapons = await this.prisma.weapon.findMany({
      orderBy: { id: 'asc' },
    });
    return prismaWeapons.map((w) => this.toDomain(w));
  }
}
