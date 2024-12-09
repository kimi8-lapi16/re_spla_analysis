import { Request, Response } from 'express';
import jsonwebtoken from "jsonwebtoken";
import getTokenFromCookie from '../getToken';
import getUserId from '../getUserId';
import { LoginRequest, SignUpRequest } from '../type/LoginRequest';
import UserService from './userService';

const userService = new UserService();
const jwtKey = process.env.JWT_SECRET_KEY!!

class UserController {
  async login(req: LoginRequest, res: Response) {
    try {
      const user = await userService.login(req.body.input);
      const token = jsonwebtoken.sign({ userId: user.id }, jwtKey, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, sameSite: 'none' });
      res.status(200).json({ token });
    } catch(e) {
      console.error(e);
      res.status(400).send("Invalid Request. Please check your parameters, so retry.")
    }
  }

  async logout(req: Request, res: Response) {
    const token = getTokenFromCookie(req);
    res.cookie('token', token, { maxAge: 0 });
  }

  async signUp(req: SignUpRequest, res: Response) {
    try {
      const user = await userService.signUp(req.body.input);
      const token = jsonwebtoken.sign({ userId: user.id }, jwtKey, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true, sameSite: 'none' });
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
    const user = await userService.upsert(req.body.input);
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
