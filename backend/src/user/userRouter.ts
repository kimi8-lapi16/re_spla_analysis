import { Router } from 'express';
import UserController from './userController';

const userRouter = Router();
const controller = new UserController();

userRouter.get('/', controller.findAll);

export default userRouter;
