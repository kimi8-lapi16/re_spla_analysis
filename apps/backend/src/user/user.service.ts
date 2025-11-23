import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { CreateUserDto, UserResponseDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
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
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }
    return this.toUserResponse(user);
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'your-secret-key'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'your-refresh-secret-key'),
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
  }): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
