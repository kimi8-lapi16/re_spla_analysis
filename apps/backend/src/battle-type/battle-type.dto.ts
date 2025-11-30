import { ApiProperty } from '@nestjs/swagger';

export class BattleTypeResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Regular Battle' })
  name: string;
}

export class GetBattleTypesResponse {
  @ApiProperty({ type: [BattleTypeResponse], description: 'List of all battle types' })
  battleTypes: BattleTypeResponse[];
}
