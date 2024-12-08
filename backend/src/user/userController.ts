import { Request, Response } from 'express';
import UserService from './userService';

const userService = new UserService();

class UserController {
  // TODO: 単純に全件取得するのではなく、クエリパラメータで絞り込みできるようにする
  async findAll(req: Request, res: Response) {
    res.json({ users: await userService.findAll() });
  }
}

export default UserController;
