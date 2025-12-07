import { useMutation, useQuery } from "@tanstack/react-query";
import { MatchesService } from "../api";
import type {
  BulkCreateMatchesRequest,
  BulkUpdateMatchesRequest,
  BulkDeleteMatchesRequest,
  SearchMatchesRequest,
} from "../api";

export function useBulkCreateMatches() {
  return useMutation({
    mutationFn: (data: BulkCreateMatchesRequest) =>
      MatchesService.matchControllerBulkCreateMatches(data),
  });
}

export function useSearchMatches(searchParams: SearchMatchesRequest) {
  return useQuery({
    queryKey: ["matches", "search", searchParams],
    queryFn: () => MatchesService.matchControllerSearchMatches(searchParams),
    enabled: !!searchParams.operator,
  });
}

export function useBulkUpdateMatches() {
  return useMutation({
    mutationFn: (data: BulkUpdateMatchesRequest) =>
      MatchesService.matchControllerBulkUpdateMatches(data),
  });
}

export function useBulkDeleteMatches() {
  return useMutation({
    mutationFn: (data: BulkDeleteMatchesRequest) =>
      MatchesService.matchControllerBulkDeleteMatches(data),
  });
}
