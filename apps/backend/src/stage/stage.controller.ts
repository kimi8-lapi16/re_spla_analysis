import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StageService } from './stage.service';
import { GetStagesResponse } from './stage.dto';

@ApiTags('stages')
@Controller('stages')
export class StageController {
  constructor(private readonly stageService: StageService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stages' })
  @ApiResponse({
    status: 200,
    description: 'List of all stages',
    type: GetStagesResponse,
  })
  async findAll(): Promise<GetStagesResponse> {
    return this.stageService.findAll();
  }
}
