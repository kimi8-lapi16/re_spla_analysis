import { Injectable } from '@nestjs/common';
import { Weapon } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WeaponRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Weapon | null> {
    return this.prisma.weapon.findUnique({
      where: { id },
    });
  }

  async findByIds(ids: number[]): Promise<Weapon[]> {
    return this.prisma.weapon.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  async findAll(): Promise<Weapon[]> {
    return this.prisma.weapon.findMany();
  }
}
