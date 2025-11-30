import { ApiProperty } from '@nestjs/swagger';
import { Rule } from './rule.entity';

export class GetRulesResponse {
  @ApiProperty({ type: [Rule], description: 'List of all rules' })
  rules: Rule[];
}
