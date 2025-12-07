import { Injectable } from '@nestjs/common';
import { AnalysisUseCase } from './analysis.usecase';
import {
  GetVictoryRateRequest,
  GetVictoryRateResponse,
  GetPointTransitionRequest,
  GetPointTransitionResponse,
} from './analysis.dto';
import { parseIsoStringAsLocalTime } from '../common/utils/date.util';

@Injectable()
export class AnalysisService {
  constructor(private readonly analysisUseCase: AnalysisUseCase) {}

  async getVictoryRate(
    userId: string,
    request: GetVictoryRateRequest,
  ): Promise<GetVictoryRateResponse> {
    const victoryRates = await this.analysisUseCase.getVictoryRate(
      userId,
      request.groupBy,
    );

    return { victoryRates };
  }

  async getPointTransition(
    userId: string,
    request: GetPointTransitionRequest,
  ): Promise<GetPointTransitionResponse> {
    const startDate = request.startDate
      ? parseIsoStringAsLocalTime(request.startDate)
      : undefined;
    const endDate = request.endDate
      ? parseIsoStringAsLocalTime(request.endDate)
      : undefined;

    const results = await this.analysisUseCase.getPointTransition(
      userId,
      request.ruleId,
      startDate,
      endDate,
    );

    return {
      points: results.map((item) => ({
        gameDateTime: item.gameDateTime.toISOString(),
        point: item.point,
      })),
    };
  }
}
