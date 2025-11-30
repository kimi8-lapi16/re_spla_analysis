import { ApiProperty } from '@nestjs/swagger';

export class Rule {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: 'Turf War', type: String })
  name: string;
}
