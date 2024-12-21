import { BattleType, MatchResult } from '@prisma/client';
import { Request, Response } from 'express';
import { AndOr } from '../type/SearchRequest';
import AnalysisService from "./analysisService";

const service = new AnalysisService();

export default class AnalysisController {
  async search(req: Request, res: Response) {
    const ruleIds = req.query.ruleId as string[];
    const stageIds = req.query.stageId as string[];
    const weaponIds = req.query.weaponId as string[];
    const matchResults = req.query.matchResult as MatchResult[];
    const battleTypes = req.query.battleType as BattleType[];
    const andOr = req.query.andOr as AndOr;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const conditions = { ruleIds, stageIds, weaponIds, matchResults, battleTypes, andOr, startDate, endDate } 
    res.json({ analysis: await service.findByConditions(conditions)});
  }
}
