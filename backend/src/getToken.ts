import { Request } from "express";

export default function getTokenFromCookie(req: Request) {
  console.log('req.cookies.token ---', req.cookies.token);
  console.log('req.headers["authorization"] ---', req.headers["authorization"]);

  return req.cookies.token;
}