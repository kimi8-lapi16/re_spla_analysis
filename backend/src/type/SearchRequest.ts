import { BattleType, MatchResult } from "@prisma/client";

export interface SearchCondtions {
  ruleIds: string[]
  stageIds?: string[]
  weaponIds?: string[]
  matchResults?: MatchResult[]
  battleTypes?: BattleType[]
  andOr?: AndOr
  startDate?: string
  endDate?: string
}

export type AndOr = "AND" | "OR"
