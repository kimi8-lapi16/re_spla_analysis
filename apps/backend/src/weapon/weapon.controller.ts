import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeaponService } from './weapon.service';
import { GetWeaponsResponse } from './weapon.dto';

@ApiTags('weapons')
@Controller('weapons')
export class WeaponController {
  constructor(private readonly weaponService: WeaponService) {}

  @Get()
  @ApiOperation({ summary: 'Get all weapons with sub and special weapons' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all weapons',
    type: GetWeaponsResponse,
  })
  async getWeapons(): Promise<GetWeaponsResponse> {
    return this.weaponService.findAll();
  }
}
