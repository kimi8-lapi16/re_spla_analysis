import { useAtomValue } from "jotai";
import { useState } from "react";
import { ruleApiAtom } from "./config";

export function useGetRules() {
  const [loading, setLoading] = useState(true);
  const ruleApi = useAtomValue(ruleApiAtom);
  async function getRules() {
    setLoading(true);
    const { data } = await ruleApi.rulesGet({ withCredentials: true });
    setLoading(false);
    return data.rules;
  }
  return { loading, getRules }
}