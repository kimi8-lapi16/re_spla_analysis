import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetCurrentUser } from '../common/decorators/current-user.decorator';
import { AnalysisService } from './analysis.service';
import {
  GetVictoryRateRequest,
  GetVictoryRateResponse,
  GetPointTransitionRequest,
  GetPointTransitionResponse,
  GroupByField,
} from './analysis.dto';

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('victory-rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get victory rate grouped by specified fields' })
  @ApiQuery({
    name: 'groupBy',
    type: [String],
    enum: GroupByField,
    isArray: true,
    required: true,
    description: 'Fields to group by',
    example: ['rule', 'stage'],
  })
  @ApiResponse({
    status: 200,
    description: 'Victory rates retrieved successfully',
    type: GetVictoryRateResponse,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getVictoryRate(
    @GetCurrentUser('userId') userId: string,
    @Query() request: GetVictoryRateRequest,
  ): Promise<GetVictoryRateResponse> {
    return this.analysisService.getVictoryRate(userId, request);
  }

  @Get('point-transition')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get point transition for a specific rule' })
  @ApiQuery({
    name: 'ruleId',
    type: Number,
    required: true,
    description: 'Rule ID to filter by',
    example: 1,
  })
  @ApiQuery({
    name: 'battleTypeId',
    type: Number,
    required: true,
    description: 'Battle Type ID to filter by',
    example: 1,
  })
  @ApiQuery({
    name: 'startDate',
    type: String,
    required: false,
    description: 'Start date (ISO8601)',
    example: '2024-11-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    required: false,
    description: 'End date (ISO8601)',
    example: '2024-11-30T23:59:59Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Point transition retrieved successfully',
    type: GetPointTransitionResponse,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPointTransition(
    @GetCurrentUser('userId') userId: string,
    @Query() request: GetPointTransitionRequest,
  ): Promise<GetPointTransitionResponse> {
    return this.analysisService.getPointTransition(userId, request);
  }
}
