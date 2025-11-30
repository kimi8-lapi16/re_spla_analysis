import { Injectable } from '@nestjs/common';
import { RuleRepository } from './rule.repository';
import { GetRulesResponse, RuleResponse } from './rule.dto';

@Injectable()
export class RuleService {
  constructor(private readonly ruleRepository: RuleRepository) {}

  async findAll(): Promise<GetRulesResponse> {
    const rules = await this.ruleRepository.findAll();
    const ruleResponses: RuleResponse[] = rules.map((rule) => ({
      id: rule.id,
      name: rule.name,
    }));
    return { rules: ruleResponses };
  }
}
