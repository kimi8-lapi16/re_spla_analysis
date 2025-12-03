import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { CreateUser, UpdateUser, UserResponse } from './user.dto';
import { UserUseCase } from './user.usecase';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userUseCase: UserUseCase,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(dto: CreateUser): Promise<UserResponse> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userUseCase.createUserWithSecret({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    if (!user) {
      throw new InternalServerErrorException('Failed to create user');
    }

    return this.toUserResponse(user);
  }

  async findByEmail(email: string) {
    return this.userUseCase.findUserWithSecretByEmail(email);
  }

  async findById(id: string): Promise<UserResponse | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }
    return this.toUserResponse(user);
  }

  async updateUser(
    userId: string,
    dto: UpdateUser,
  ): Promise<UserResponse> {
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(dto.email);
      if (userWithEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    let hashedPassword: string | undefined;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.userUseCase.updateUserWithSecret(userId, {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    return this.toUserResponse(updatedUser);
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'your-secret-key'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>(
        'JWT_REFRESH_SECRET',
        'your-refresh-secret-key',
      ),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private toUserResponse(user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
