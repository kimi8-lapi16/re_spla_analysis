import { Request, Response } from 'express';
import RuleService from "./ruleService";

const service = new RuleService();

export default class RuleController {
  async gets(req: Request, res: Response) {
    res.json({ rules: await service.getAll()})
  }
}
