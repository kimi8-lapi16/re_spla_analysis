import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { CookieOptions } from 'express';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class JwtPayload {
  sub: string;
  email: string;
}

export interface ResponseWithCookie {
  cookie(name: string, val: string, options: CookieOptions): this;
}