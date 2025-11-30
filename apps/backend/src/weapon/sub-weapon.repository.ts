import { Injectable } from '@nestjs/common';
import { SubWeapon } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubWeaponRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SubWeapon[]> {
    return this.prisma.subWeapon.findMany();
  }

  async findByIds(ids: number[]): Promise<SubWeapon[]> {
    return this.prisma.subWeapon.findMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
