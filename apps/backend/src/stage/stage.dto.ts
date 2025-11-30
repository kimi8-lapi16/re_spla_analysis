import { ApiProperty } from '@nestjs/swagger';
import { Stage } from './stage.entity';

export class GetStagesResponse {
  @ApiProperty({ type: [Stage], description: 'List of all stages' })
  stages: Stage[];
}
