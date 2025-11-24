import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { CookieOptions } from 'express';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export interface ResponseWithCookie {
  cookie(name: string, val: string, options: CookieOptions): this;
}