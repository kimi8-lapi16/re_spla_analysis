import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from 'generated/prisma/client';
import { PrismaTransaction } from 'src/prisma/prisma.types';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      deletedAt: prismaUser.deletedAt,
    };
  }

  async create(
    data: { name: string; email: string },
    tx?: PrismaTransaction,
  ): Promise<User> {
    const client = tx ?? this.prisma;
    const prismaUser = await client.user.create({
      data: {
        name: data.name,
        email: data.email,
      },
    });
    return this.toDomain(prismaUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });
    return prismaUser ? this.toDomain(prismaUser) : null;
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });
    return prismaUser ? this.toDomain(prismaUser) : null;
  }

  async update(
    id: string,
    data: { name?: string; email?: string },
    tx?: PrismaTransaction,
  ): Promise<User> {
    const client = tx ?? this.prisma;
    const prismaUser = await client.user.update({
      where: { id },
      data,
    });
    return this.toDomain(prismaUser);
  }

  async delete(id: string): Promise<User> {
    const prismaUser = await this.prisma.user.delete({
      where: { id },
    });
    return this.toDomain(prismaUser);
  }
}
