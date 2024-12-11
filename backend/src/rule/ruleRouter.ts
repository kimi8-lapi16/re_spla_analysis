import { Router } from 'express';
import RuleController from './ruleController';

const ruleRouter = Router();
const controller = new RuleController();

ruleRouter.get('/', controller.gets);

export default ruleRouter;
