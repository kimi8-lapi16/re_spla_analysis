/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from "express";
import { jwtDecode } from "jwt-decode";

export function getTokenFromCookie(req: Request) {
  return req.cookies.token;
}

export function getUserId(req: Request) {
  const token = getTokenFromCookie(req);
  if(!token) {
    throw new Error("Unauthroized");
  }
  const payload = jwtDecode(token);
  // TODO: payloadに対して型安全に扱えるようにどうにかこうにかする
  // @ts-ignore
  if (!payload.userId) {
    throw new Error("Unauthroized");
  }
  // @ts-ignore
  return payload.userId;
}
