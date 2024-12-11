import { useAtomValue } from "jotai";
import { useState } from "react";
import { stageApiAtom } from "./config";

export function useGetStages() {
  const [loading, setLoading] = useState(true);
  const stageApi = useAtomValue(stageApiAtom);
  async function getStages() {
    setLoading(true);
    const { data } = await stageApi.stagesGet({ withCredentials: true });
    setLoading(false);
    return data.stages;
  }
  return { loading, getStages }
}