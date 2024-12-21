import { Prisma, Rule } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import BaseRepository from "../baseRepository";
import { BaseCrudRepositoryInterface, SingletonRepositoryInterface } from "../type/RepositoryInterface";

export default class RuleRepository extends BaseRepository implements SingletonRepositoryInterface<RuleRepository>, BaseCrudRepositoryInterface<Rule, Prisma.RuleWhereInput> {
  private static instance: RuleRepository
  private static rule: Prisma.RuleDelegate<DefaultArgs>;

  private constructor() {
    super();
    RuleRepository.instance = this;
    RuleRepository.rule = this.client.rule;
  }

  getInstance(): RuleRepository {
    return RuleRepository.getInstance();
  }

  static getInstance(): RuleRepository {
    if (this.instance) {
      return this.instance;
    } else {
      return new RuleRepository();
    }
  }

  async findOneById(id: string): Promise<Rule> {
    return await RuleRepository.rule.findUniqueOrThrow({
      where: {
        id
      }
    });
  }

  async read(): Promise<Rule[]> {
    return await RuleRepository.rule.findMany();
  }

  create(param: Rule): Promise<Rule> {
    console.log(param);
    throw new Error("Method not implemented.");
  }

  update(param: Rule): Promise<Rule> {
    console.log(param);
    throw new Error("Method not implemented.");
  }

  delete(id: string): Promise<void> {
    console.log(id);
    throw new Error("Method not implemented.");
  }
}