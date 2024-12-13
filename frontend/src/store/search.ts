import { atom } from "jotai";

interface SearchCondition {
  ruleIds: string[]
  weaponIds: string[],
  stageIds: string[],
  matchResults: string[],
  battleTypes: string[],
}

export const searchConditionAtom = atom<SearchCondition>({
  ruleIds: [],
  weaponIds: [],
  stageIds: [],
  matchResults: [],
  battleTypes: [],
});

export const searchResultAtom = atom(async (get) => {
  return get(searchConditionAtom);
});