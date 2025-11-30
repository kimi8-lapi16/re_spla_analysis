import { Injectable } from '@nestjs/common';
import { MatchUseCase } from './match.usecase';
import {
  BulkCreateMatchesRequest,
  BulkCreateMatchesResponse,
} from './dto';

@Injectable()
export class MatchService {
  constructor(private readonly matchUseCase: MatchUseCase) {}

  async bulkCreateMatches(
    userId: string,
    request: BulkCreateMatchesRequest,
  ): Promise<BulkCreateMatchesResponse> {
    await this.matchUseCase.bulkCreateMatches(userId, request.matches);
    return { success: true };
  }
}
