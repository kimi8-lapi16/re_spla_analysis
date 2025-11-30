import { ApiProperty } from '@nestjs/swagger';
import { BattleType } from './battle-type.entity';

export class GetBattleTypesResponse {
  @ApiProperty({ type: [BattleType], description: 'List of all battle types' })
  battleTypes: BattleType[];
}
