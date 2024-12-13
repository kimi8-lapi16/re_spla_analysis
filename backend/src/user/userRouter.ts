import { Router } from 'express';
import UserController from './userController';

const userRouter = Router();
const controller = new UserController();

userRouter.post('/login', controller.login);
userRouter.post('/signUp', controller.signUp);
userRouter.post('/logout', controller.logout);
userRouter.get('/', controller.getUser);
userRouter.post('/', controller.updateUser);

export default userRouter;
