import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserWithSecret } from './user.dto';
import { UserSecretRepository } from './user-secret.repository';
import { UserRepository } from './user.repository';

@Injectable()
export class UserUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly userSecretRepository: UserSecretRepository,
  ) {}

  async createUserWithSecret(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserWithSecret> {
    return this.prisma.$transaction(async (tx) => {
      const user = await this.userRepository.create(
        {
          name: data.name,
          email: data.email,
        },
        tx,
      );

      const secret = await this.userSecretRepository.create(
        {
          userId: user.id,
          password: data.password,
        },
        tx,
      );

      return {
        ...user,
        secret,
      };
    });
  }

  async findUserWithSecretByEmail(
    email: string,
  ): Promise<UserWithSecret | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const secret = await this.userSecretRepository.findByUserId(user.id);

    return {
      ...user,
      secret,
    };
  }

  async findUserWithSecretById(id: string): Promise<UserWithSecret | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }

    const secret = await this.userSecretRepository.findByUserId(user.id);

    return {
      ...user,
      secret,
    };
  }

  async updateUserWithSecret(
    userId: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
    },
  ): Promise<UserWithSecret> {
    return this.prisma.$transaction(async (tx) => {
      const user = await this.userRepository.update(
        userId,
        {
          name: data.name,
          email: data.email,
        },
        tx,
      );

      let secret: { userId: string; password: string } | null = null;
      if (data.password) {
        secret = await this.userSecretRepository.update(userId, data.password);
      } else {
        secret = await this.userSecretRepository.findByUserId(userId);
      }

      return {
        ...user,
        secret,
      };
    });
  }
}
