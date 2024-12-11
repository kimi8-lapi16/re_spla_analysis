import { Prisma, Stage } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import BaseRepository from "../baseRepository";
import { BaseCrudRepositoryInterface, SingletonServiceInterface } from "../type/CommonInterface";

export default class StageRepository extends BaseRepository implements SingletonServiceInterface<StageRepository>, BaseCrudRepositoryInterface<Stage> {
  private static instance: StageRepository
  private static stage: Prisma.StageDelegate<DefaultArgs>;

  private constructor() {
    super();
    StageRepository.instance = this;
    StageRepository.stage = this.client.stage;
  }

  getInstance(): StageRepository {
    return StageRepository.getInstance();
  }

  static getInstance(): StageRepository {
    if (this.instance) {
      return this.instance;
    } else {
      return new StageRepository();
    }
  }

  async read(): Promise<Stage[]> {
    return await StageRepository.stage.findMany();
  }

  async findOneById(id: string): Promise<Stage> {
    return await StageRepository.stage.findUniqueOrThrow({
      where: {
        id
      }
    })
  }

  /**
   * 以下のメソッド類はseed.tsで入れるので、呼び出せないようにする
   * console.logはeslintで怒られないようにするため
   */
  create(param: Stage): Promise<Stage> {
    console.log(param)
    throw new Error("Method not implemented.");
  }

  update(param: Stage): Promise<Stage> {
    console.log(param)
    throw new Error("Method not implemented.");
  }

  delete(id: string): Promise<void> {
    console.log(id)
    throw new Error("Method not implemented.");
  }
}
