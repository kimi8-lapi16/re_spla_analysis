import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RuleService } from './rule.service';
import { GetRulesResponse } from './rule.dto';

@ApiTags('rules')
@Controller('rules')
export class RuleController {
  constructor(private readonly ruleService: RuleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all rules' })
  @ApiResponse({
    status: 200,
    description: 'List of all rules',
    type: GetRulesResponse,
  })
  async findAll(): Promise<GetRulesResponse> {
    return this.ruleService.findAll();
  }
}
