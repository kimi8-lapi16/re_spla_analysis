import { useMemo } from "react";
import { SearchMatchesRequest } from "../api";
import { useVictoryRate } from "./useAnalysis";
import { useSearchMatches } from "./useMatch";

/** How many of the most recent matches count as "form". */
export const RECENT_MATCH_COUNT = 10;

/**
 * Every rule the user has played fits well inside one page, and every match has
 * exactly one rule - so summing this grouping gives exact totals in one request.
 */
const RULE_GROUP_PAGE_SIZE = 100;

export interface DashboardSummary {
  totalCount: number;
  winCount: number;
  /** 0-1, or null when there are no matches yet. */
  overallVictoryRate: number | null;
  /** 0-1 over the last RECENT_MATCH_COUNT matches, or null when there are none. */
  recentVictoryRate: number | null;
  recentSampleSize: number;
  /** The most recently recorded point, or null when no match carries one. */
  latestPoint: number | null;
  latestPointRuleId: number | null;
}

export function useDashboardSummary() {
  const victoryRateQuery = useVictoryRate({
    groupBy: ["rule"],
    page: 1,
    pageSize: RULE_GROUP_PAGE_SIZE,
  });

  const recentMatchesQuery = useSearchMatches({
    operator: SearchMatchesRequest.operator.AND,
    page: 1,
    pageCount: RECENT_MATCH_COUNT,
    sortBy: SearchMatchesRequest.sortBy.GAME_DATE_TIME,
    sortOrder: SearchMatchesRequest.sortOrder.DESC,
  });

  const summary = useMemo((): DashboardSummary | undefined => {
    const rates = victoryRateQuery.data?.victoryRates;
    const recent = recentMatchesQuery.data?.matches;
    if (!rates || !recent) return undefined;

    const totalCount = rates.reduce((sum, item) => sum + item.totalCount, 0);
    const winCount = rates.reduce((sum, item) => sum + item.winCount, 0);
    const recentWins = recent.filter((match) => match.result === "WIN").length;
    const latest = recent.find((match) => match.point !== null);

    return {
      totalCount,
      winCount,
      overallVictoryRate: totalCount > 0 ? winCount / totalCount : null,
      recentVictoryRate: recent.length > 0 ? recentWins / recent.length : null,
      recentSampleSize: recent.length,
      latestPoint: latest?.point ?? null,
      latestPointRuleId: latest?.ruleId ?? null,
    };
  }, [victoryRateQuery.data, recentMatchesQuery.data]);

  return {
    data: summary,
    isLoading: victoryRateQuery.isLoading || recentMatchesQuery.isLoading,
    isError: victoryRateQuery.isError || recentMatchesQuery.isError,
  };
}
