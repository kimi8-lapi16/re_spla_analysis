import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetCurrentUser } from '../common/decorators/current-user.decorator';
import { MatchService } from './match.service';
import {
  BulkCreateMatchesRequest,
  BulkCreateMatchesResponse,
  SearchMatchesRequest,
  SearchMatchesResponse,
} from './match.dto';

@ApiTags('matches')
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk create multiple matches' })
  @ApiBody({ type: BulkCreateMatchesRequest })
  @ApiResponse({
    status: 201,
    description: 'Matches successfully created',
    type: BulkCreateMatchesResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or validation failed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bulkCreateMatches(
    @GetCurrentUser('userId') userId: string,
    @Body() request: BulkCreateMatchesRequest,
  ): Promise<BulkCreateMatchesResponse> {
    return this.matchService.bulkCreateMatches(userId, request);
  }

  @Post('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search matches with filters' })
  @ApiBody({ type: SearchMatchesRequest })
  @ApiResponse({
    status: 200,
    description: 'Matches found successfully',
    type: SearchMatchesResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search parameters',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchMatches(
    @GetCurrentUser('userId') userId: string,
    @Body() request: SearchMatchesRequest,
  ): Promise<SearchMatchesResponse> {
    return this.matchService.searchMatches(userId, request);
  }
}
