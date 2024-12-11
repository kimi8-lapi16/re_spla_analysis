import { Router } from 'express';
import WeaponController from './weaponController';

const weaponRouter = Router();
const controller = new WeaponController();

weaponRouter.get('/', controller.gets);

export default weaponRouter;
