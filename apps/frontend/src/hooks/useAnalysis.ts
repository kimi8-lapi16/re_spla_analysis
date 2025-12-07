import { useQuery } from '@tanstack/react-query';
import { AnalysisService } from '../api';

export type GroupByField = 'rule' | 'stage' | 'weapon' | 'battleType';

export interface UseVictoryRateParams {
  groupBy: GroupByField[];
  enabled?: boolean;
}

export function useVictoryRate(params: UseVictoryRateParams) {
  return useQuery({
    queryKey: ['analysis', 'victoryRate', params.groupBy],
    queryFn: () =>
      AnalysisService.analysisControllerGetVictoryRate(params.groupBy),
    enabled: params.enabled !== false && params.groupBy.length > 0,
  });
}

export interface UsePointTransitionParams {
  ruleId: number;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

export function usePointTransition(params: UsePointTransitionParams) {
  return useQuery({
    queryKey: [
      'analysis',
      'pointTransition',
      params.ruleId,
      params.startDate,
      params.endDate,
    ],
    queryFn: () =>
      AnalysisService.analysisControllerGetPointTransition(
        params.ruleId,
        params.endDate,
        params.startDate,
      ),
    enabled: params.enabled !== false && params.ruleId > 0,
  });
}
