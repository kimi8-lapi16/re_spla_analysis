import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma/client';
import { PrismaTransaction } from 'src/prisma/prisma.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: { name: string; email: string },
    tx?: PrismaTransaction,
  ): Promise<User> {
    const client = tx ?? this.prisma;
    return client.user.create({
      data: {
        name: data.name,
        email: data.email,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: { name?: string; email?: string },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
