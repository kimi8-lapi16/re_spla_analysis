import { Request } from "express"

export interface LoginRequest extends Request {
  input?: LoginBody
}

export interface LoginBody {
  mailAddress: string
  password: string
}

export interface SignUpRequest extends Request {
  input?: SingUpBody
}

export interface SingUpBody extends LoginBody{
  name: string
}