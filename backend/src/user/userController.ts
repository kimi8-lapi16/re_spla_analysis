import { Request, Response } from 'express';
import jsonwebtoken from "jsonwebtoken";
import { LoginRequest, SignUpRequest } from '../type/LoginRequest';
import UserService from './userService';

const userService = new UserService();
const jwtSecret = 'secret123';

class UserController {
  async login(req: LoginRequest, res: Response) {
    try {
      const user = await userService.login(req.body.input);
      console.log('login Result User ---', {user})
      const token = jsonwebtoken.sign({ user: user.id }, jwtSecret)
      console.log('generate token --- ', {token})
      res.cookie('token', token, { httpOnly: true });
      res.status(200).json({ token });
    } catch(e) {
      res.status(400).send("Invalid Request. Please check your parameters, so retry.")
    }
  }

  async signUp(req: SignUpRequest, res: Response) {
    try {
      const user = await userService.signUp(req.body.input);
      console.log('signUp Result User ---', {user})
      const token = jsonwebtoken.sign({ user: user.id }, jwtSecret)
      console.log('generate token --- ', {token})
      res.cookie('token', token, { httpOnly: true });
      res.status(200).json({ token });
    } catch(e) {
      res.status(400).send("Invalid Request. Please check your parameters, so retry.")
    }
  }

  async getUser(req: Request, res: Response) {
    // TODO: jwtからuserIdを抜き取る
    try {
      const user = await userService.get("id")
      res.json({ user });
    } catch(e) {
      res.status(404).send("Not Found User")
    }
  }

  async updateUser(req: Request, res: Response) {
    const user = await userService.upsert(req.body.input)
    res.status(200).json({ isSuccess: true })
  }

  async deleteUser(req: Request, res: Response) {
    // TODO: jwtからuserIdを抜き取る
    // await userService.delete(req.path.id)
    res.status(200).json({ isSuccess: true })
  }
}

export default UserController;
