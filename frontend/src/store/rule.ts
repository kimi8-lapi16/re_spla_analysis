import { atomWithRefresh } from "jotai/utils";
import { Rule } from "../../generated";
import { useGetRules } from "../api/ruleApi";

export const ruleAtom = atomWithRefresh(async () => {
  try {
    const { getRules } = useGetRules();
    const rules = await getRules();
    return rules;
  } catch(e) {
    console.error(e)
    return [] as Rule[]
  }
});