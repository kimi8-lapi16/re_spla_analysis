import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BattleTypeService } from './battle-type.service';
import { GetBattleTypesResponse } from './battle-type.dto';

@ApiTags('battle-types')
@Controller('battle-types')
export class BattleTypeController {
  constructor(private readonly battleTypeService: BattleTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all battle types' })
  @ApiResponse({
    status: 200,
    description: 'List of all battle types',
    type: GetBattleTypesResponse,
  })
  async findAll(): Promise<GetBattleTypesResponse> {
    return this.battleTypeService.findAll();
  }
}
