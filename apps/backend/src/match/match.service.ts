import { Injectable } from '@nestjs/common';
import { MatchUseCase } from './match.usecase';
import { MatchRepository } from './match.repository';
import {
  BulkCreateMatchesRequest,
  BulkCreateMatchesResponse,
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
}
