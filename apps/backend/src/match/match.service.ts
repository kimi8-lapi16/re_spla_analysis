import { Injectable, ForbiddenException } from '@nestjs/common';
import { MatchUseCase } from './match.usecase';
import { MatchRepository } from './match.repository';
import {
  BulkCreateMatchesRequest,
  BulkCreateMatchesResponse,
  BulkUpdateMatchesRequest,
  BulkUpdateMatchesResponse,
  BulkDeleteMatchesRequest,
  BulkDeleteMatchesResponse,
  SearchMatchesRequest,
  SearchMatchesResponse,
  MatchResponse,
} from './match.dto';
import { parseIsoStringAsLocalTime } from '../common/utils/date.util';

@Injectable()
export class MatchService {
  constructor(
    private readonly matchUseCase: MatchUseCase,
    private readonly matchRepository: MatchRepository,
  ) {}

  async bulkCreateMatches(
    userId: string,
    request: BulkCreateMatchesRequest,
  ): Promise<BulkCreateMatchesResponse> {
    await this.matchUseCase.bulkCreateMatches(userId, request.matches);
    return { success: true };
  }

  async searchMatches(
    userId: string,
    request: SearchMatchesRequest,
  ): Promise<SearchMatchesResponse> {
    const skip = (request.page - 1) * request.pageCount;
    const take = request.pageCount;

    const { matches, total } = await this.matchRepository.searchMatches({
      userId,
      weaponIds: request.weapons,
      stageIds: request.stages,
      ruleIds: request.rules,
      battleTypeIds: request.battleTypes,
      results: request.results,
      startDateTime: request.startDateTime
        ? parseIsoStringAsLocalTime(request.startDateTime)
        : undefined,
      endDateTime: request.endDateTime
        ? parseIsoStringAsLocalTime(request.endDateTime)
        : undefined,
      operator: request.operator,
      skip,
      take,
    });

    const matchResponses: MatchResponse[] = matches.map((match) => ({
      id: match.id,
      weaponId: match.weaponId,
      stageId: match.stageId,
      ruleId: match.ruleId,
      battleTypeId: match.battleTypeId,
      result: match.result,
      gameDateTime: match.gameDateTime,
      point: match.point,
    }));

    return {
      matches: matchResponses,
      total,
    };
  }

  async bulkUpdateMatches(
    userId: string,
    request: BulkUpdateMatchesRequest,
  ): Promise<BulkUpdateMatchesResponse> {
    // Check ownership of all matches
    const matchIds = request.matches.map((m) => m.id);
    await this.verifyOwnership(userId, matchIds);

    await this.matchUseCase.bulkUpdateMatches(request.matches);
    return { success: true };
  }

  async bulkDeleteMatches(
    userId: string,
    request: BulkDeleteMatchesRequest,
  ): Promise<BulkDeleteMatchesResponse> {
    // Check ownership of all matches
    await this.verifyOwnership(userId, request.ids);

    // Delete matches (single table operation, no UseCase needed)
    await this.matchRepository.deleteMany(userId, request.ids);
    return { success: true };
  }

  private async verifyOwnership(userId: string, matchIds: string[]): Promise<void> {
    const ownedMatches = await this.matchRepository.findByUserIdAndIds(userId, matchIds);
    if (ownedMatches.length !== matchIds.length) {
      throw new ForbiddenException('Not all matches belong to the user');
    }
  }
}
