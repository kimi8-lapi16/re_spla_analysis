import { Injectable } from '@nestjs/common';
import { UserSecret } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaTransaction } from '../prisma/prisma.types';

@Injectable()
export class UserSecretRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: {
      userId: string;
      password: string;
    },
    tx?: PrismaTransaction,
  ): Promise<UserSecret> {
    const client = tx ?? this.prisma;
    return client.userSecret.create({
      data: {
        userId: data.userId,
        password: data.password,
      },
    });
  }

  async findByUserId(userId: string): Promise<UserSecret | null> {
    return this.prisma.userSecret.findUnique({
      where: { userId },
    });
  }

  async update(
    userId: string,
    data: { password: string },
  ): Promise<UserSecret> {
    return this.prisma.userSecret.update({
      where: { userId },
      data,
    });
  }

  async delete(userId: string): Promise<UserSecret> {
    return this.prisma.userSecret.delete({
      where: { userId },
    });
  }
}
