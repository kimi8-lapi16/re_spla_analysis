import { Injectable } from '@nestjs/common';
import { SpecialWeapon } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpecialWeaponRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SpecialWeapon[]> {
    return this.prisma.specialWeapon.findMany();
  }

  async findByIds(ids: number[]): Promise<SpecialWeapon[]> {
    return this.prisma.specialWeapon.findMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
