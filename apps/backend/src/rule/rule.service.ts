import { Injectable } from '@nestjs/common';
import { RuleRepository } from './rule.repository';
import { GetRulesResponse } from './rule.dto';

@Injectable()
export class RuleService {
  constructor(private readonly ruleRepository: RuleRepository) {}

  async findAll(): Promise<GetRulesResponse> {
    const rules = await this.ruleRepository.findAll();
    return { rules };
  }
}
