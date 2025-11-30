import { ApiProperty } from '@nestjs/swagger';

export class Stage {
  @ApiProperty({ example: 1, type: Number })
  id: number;

  @ApiProperty({ example: 'Scorch Gorge', type: String })
  name: string;
}
