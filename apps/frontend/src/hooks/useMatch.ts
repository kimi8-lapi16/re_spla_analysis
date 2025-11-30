import { useMutation, useQuery } from '@tanstack/react-query';
import {
  WeaponsService,
  StagesService,
  RulesService,
  BattleTypesService,
  MatchesService
} from '../api';
import type { BulkCreateMatchesRequest, SearchMatchesRequest } from '../api';

export function useWeapons() {
  return useQuery({
    queryKey: ['weapons'],
    queryFn: () => WeaponsService.weaponControllerGetWeapons(),
  });
}

export function useStages() {
  return useQuery({
    queryKey: ['stages'],
    queryFn: () => StagesService.stageControllerFindAll(),
  });
}

export function useRules() {
  return useQuery({
    queryKey: ['rules'],
    queryFn: () => RulesService.ruleControllerFindAll(),
  });
}

export function useBattleTypes() {
  return useQuery({
    queryKey: ['battleTypes'],
    queryFn: () => BattleTypesService.battleTypeControllerFindAll(),
  });
}

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
