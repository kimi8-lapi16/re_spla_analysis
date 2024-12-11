import { Router } from 'express';
import StageController from './stageController';

const stageRouter = Router();
const controller = new StageController();

stageRouter.get('/', controller.gets);

export default stageRouter;