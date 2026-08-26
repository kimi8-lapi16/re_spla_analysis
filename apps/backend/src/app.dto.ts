import { ApiProperty } from '@nestjs/swagger';

export class HealthResponse {
  @ApiProperty({ type: String, example: 'ok' })
  status: 'ok';
}
