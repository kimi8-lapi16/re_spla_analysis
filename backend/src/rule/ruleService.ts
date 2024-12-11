import { Rule } from "@prisma/client";
import RuleRepository from "./ruleRepository";

const ruleRepository = RuleRepository.getInstance()

export default class RuleService { 
  async getAll(): Promise<Rule[]> {
    return await ruleRepository.read();
  }
}
