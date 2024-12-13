import { Request, Response } from 'express';
import jsonwebtoken from "jsonwebtoken";
import getUserId from '../getUserId';
import { LoginRequest, SignUpRequest } from '../type/LoginRequest';
import UserService from './userService';

const userService = new UserService();
const jwtKey = process.env.JWT_SECRET_KEY!

class UserController {
  async login(req: LoginRequest, res: Response) {
    try {
      const user = await userService.login(req.body.input);
      const token = jsonwebtoken.sign({ userId: user.id }, jwtKey, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
      res.status(200).json({ token });
    } catch(e) {
      console.error(e);
      res.status(400).send("Invalid Request. Please check your parameters, so retry.")
    }
  }

  async logout(req: Request, res: Response) {
    // JWTを含むCookieを削除
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })
    // ログアウト後のレスポンス
    res.status(200).json({ isSuccess: true });
  }

  async signUp(req: SignUpRequest, res: Response) {
    try {
      const user = await userService.signUp(req.body.input);
      const token = jsonwebtoken.sign({ userId: user.id }, jwtKey, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
      res.status(200).json({ token });
    } catch(e) {
      console.error(e);
      res.status(400).send("Invalid Request. Please check your parameters, so retry.");
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const user = await userService.get(getUserId(req));
      res.json(user);
    } catch(e) {
      console.error(e);
      res.status(404).send("Not Found User")
    }
  }

  async updateUser(req: Request, res: Response) {
    await userService.upsert(req.body.input);
    res.status(200).json({ isSuccess: true });
  }

  async deleteUser(req: Request, res: Response) {
    try {
      await userService.delete(getUserId(req));
      res.status(200).json({ isSuccess: true });
    } catch(e) {
      console.error(e);
      res.status(400).send(e);
    }
  }
}

export default UserController;
