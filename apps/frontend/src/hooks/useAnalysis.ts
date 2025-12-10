import { useQuery } from "@tanstack/react-query";
import { AnalysisService } from "../api";

export type GroupByField = "rule" | "stage" | "weapon" | "battleType";
export type VictoryRateSortBy =
  | "victoryRate"
  | "totalCount"
  | "winCount"
  | "ruleName"
  | "stageName"
  | "weaponName"
  | "battleTypeName";
export type SortOrder = "asc" | "desc";

export interface UseVictoryRateParams {
  groupBy: GroupByField[];
  sortBy?: VictoryRateSortBy;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useVictoryRate(params: UseVictoryRateParams) {
  return useQuery({
    queryKey: [
      "analysis",
      "victoryRate",
      params.groupBy,
      params.sortBy,
      params.sortOrder,
      params.page,
      params.pageSize,
    ],
    queryFn: () =>
      AnalysisService.analysisControllerGetVictoryRate(
        params.groupBy,
        params.pageSize,
        params.page,
        params.sortOrder,
        params.sortBy
      ),
    enabled: params.enabled !== false && params.groupBy.length > 0,
  });
}

export interface UsePointTransitionParams {
  ruleId: number;
  battleTypeId: number;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

export function usePointTransition(params: UsePointTransitionParams) {
  return useQuery({
    queryKey: [
      "analysis",
      "pointTransition",
      params.ruleId,
      params.battleTypeId,
      params.startDate,
      params.endDate,
    ],
    queryFn: () =>
      AnalysisService.analysisControllerGetPointTransition(
        params.battleTypeId,
        params.ruleId,
        params.endDate,
        params.startDate
      ),
    enabled: params.enabled !== false && params.ruleId > 0 && params.battleTypeId > 0,
  });
}
