import { Prisma, Weapon } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import BaseRepository from "../baseRepository";
import { BaseCrudRepositoryInterface, SingletonServiceInterface } from "../type/CommonInterface";

export default class WeaponRepository extends BaseRepository implements SingletonServiceInterface<WeaponRepository>, BaseCrudRepositoryInterface<Weapon> {
  private static instance: WeaponRepository
  private static weapon: Prisma.WeaponDelegate<DefaultArgs>;

  private constructor() {
    super();
    WeaponRepository.instance = this;
    WeaponRepository.weapon = this.client.weapon;
  }

  getInstance(): WeaponRepository {
    return WeaponRepository.getInstance();
  }

  static getInstance(): WeaponRepository {
    if (this.instance) {
      return this.instance;
    } else {
      return new WeaponRepository();
    }
  }

  async findOneById(id: string): Promise<Weapon> {
    return await WeaponRepository.weapon.findUniqueOrThrow({
      where: {
        id
      }
    });
  }

  async read(): Promise<Weapon[]> {
    return await WeaponRepository.weapon.findMany();
  }

  async create(param: Omit<Weapon, "id">): Promise<Weapon> {
    return await WeaponRepository.weapon.create({
      data: {
        ...param
      }
    })
  }

  async update(param: Weapon): Promise<Weapon> {
    return await WeaponRepository.weapon.update({
      where: {
        id: param.id
      },
      data: {
        ...param
      }
    })
  }

  async delete(id: string): Promise<void> {
    await WeaponRepository.weapon.delete({
      where: {
        id
      }
    })
  }
}
