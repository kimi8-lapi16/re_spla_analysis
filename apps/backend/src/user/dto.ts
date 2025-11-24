import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { User, UserSecret } from 'generated/prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthTokenResponseDto {
  accessToken: string;
  user: UserResponseDto;
}

export type UserWithSecret = User & { secret: UserSecret | null };
