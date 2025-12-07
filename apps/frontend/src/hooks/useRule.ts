import { useQuery } from "@tanstack/react-query";
import { RulesService } from "../api";

export function useRules() {
  const query = useQuery({
    queryKey: ["rules"],
    queryFn: () => RulesService.ruleControllerFindAll(),
  });
  return {
    ...query,
    data: query.data?.rules,
  };
}
