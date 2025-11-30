import { useMutation, useQuery } from '@tanstack/react-query';
import { MatchesService } from '../api';
import type { BulkCreateMatchesRequest, SearchMatchesRequest } from '../api';

export function useBulkCreateMatches() {
  return useMutation({
    mutationFn: (data: BulkCreateMatchesRequest) =>
      MatchesService.matchControllerBulkCreateMatches(data),
  });
}

export function useSearchMatches(searchParams: SearchMatchesRequest) {
  return useQuery({
    queryKey: ['matches', 'search', searchParams],
    queryFn: () => MatchesService.matchControllerSearchMatches(searchParams),
    enabled: !!searchParams.operator,
  });
}
