import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { User, UserSecret } from 'generated/prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'securePassword123',
    minLength: 8,
    type: String,
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clx1234567890abcdefg',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-01-01T00:00:00.000Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-01T00:00:00.000Z',
    type: Date,
  })
  updatedAt: Date;
}

export class AuthTokenResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
    type: () => UserResponseDto,
  })
  user: UserResponseDto;
}

export type UserWithSecret = User & { secret: UserSecret | null };
