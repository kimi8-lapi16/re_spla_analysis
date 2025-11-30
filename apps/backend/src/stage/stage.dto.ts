import { ApiProperty } from '@nestjs/swagger';

export class StageResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Scorch Gorge' })
  name: string;
}

export class GetStagesResponse {
  @ApiProperty({ type: [StageResponse], description: 'List of all stages' })
  stages: StageResponse[];
}
