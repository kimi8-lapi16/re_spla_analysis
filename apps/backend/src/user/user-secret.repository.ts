import { Injectable } from '@nestjs/common';
import { UserSecret as PrismaUserSecret } from 'generated/prisma/client';
import { PrismaTransaction } from 'src/prisma/prisma.types';
import { PrismaService } from '../prisma/prisma.service';
import { UserSecret } from './user.entity';

@Injectable()
export class UserSecretRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaUserSecret: PrismaUserSecret): UserSecret {
    return {
      userId: prismaUserSecret.userId,
      password: prismaUserSecret.password,
    };
  }

  async create(
    data: { userId: string; password: string },
    tx?: PrismaTransaction,
  ): Promise<UserSecret> {
    const client = tx ?? this.prisma;
    const prismaUserSecret = await client.userSecret.create({
      data: {
        userId: data.userId,
        password: data.password,
      },
    });
    return this.toDomain(prismaUserSecret);
  }

  async findByUserId(userId: string): Promise<UserSecret | null> {
    const prismaUserSecret = await this.prisma.userSecret.findUnique({
      where: { userId },
    });
    return prismaUserSecret ? this.toDomain(prismaUserSecret) : null;
  }

  async update(userId: string, password: string): Promise<UserSecret> {
    const prismaUserSecret = await this.prisma.userSecret.update({
      where: { userId },
      data: { password },
    });
    return this.toDomain(prismaUserSecret);
  }
}
