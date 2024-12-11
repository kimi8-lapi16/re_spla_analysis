import { Weapon } from "@prisma/client";
import WeaponRepository from "./weaponRepository";

const weaponRepository = WeaponRepository.getInstance();

export default class WeaponService {
  async getAll(): Promise<Weapon[]> { 
    return await weaponRepository.read();
  }
}
