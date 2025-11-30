import { ApiProperty } from '@nestjs/swagger';

export class BattleType {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: 'Regular Battle', type: String })
  name: string;
}
