import { Injectable } from '@nestjs/common';
import { User, UserSecret } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';


export type UserWithSecret = User & { secret: UserSecret | null };

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserWithSecret> {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        secret: {
          create: {
            password: data.password,
          },
        },
      },
      include: {
        secret: true,
      },
    });
  }

  async findByEmail(email: string): Promise<UserWithSecret | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        secret: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdWithSecret(id: string): Promise<UserWithSecret | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        secret: true,
      },
    });
  }
}
