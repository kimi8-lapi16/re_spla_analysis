import { Request, Response } from 'express';
import StageService from './stageService';

const service = new StageService();

export default class StageController {
  async gets(req: Request, res: Response) {
    res.json({ stages: await service.getAll()})
  }
}
