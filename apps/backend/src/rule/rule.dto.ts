import { ApiProperty } from '@nestjs/swagger';

export class RuleResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Turf War' })
  name: string;
}

export class GetRulesResponse {
  @ApiProperty({ type: [RuleResponse], description: 'List of all rules' })
  rules: RuleResponse[];
}
