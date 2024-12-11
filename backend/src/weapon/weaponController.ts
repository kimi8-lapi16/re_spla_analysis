import { Request, Response } from 'express';
import WeaponService from './weaponService';

const service = new WeaponService();

export default class WeaponController {
  async gets(req: Request, res: Response) {
    res.json({ weapons: await service.getAll()})
  }
}
