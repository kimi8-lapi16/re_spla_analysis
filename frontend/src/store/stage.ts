import { atomWithRefresh } from "jotai/utils";
import { Stage } from "../../generated";
import { useGetStages } from "../api/stageApi";

export const stageAtom = atomWithRefresh(async (): Promise<Stage[]> => {
  try {
    const { getStages } = useGetStages();
    const stages = await getStages();
    return stages;
  } catch(e) {
    console.error(e)
    return [] as Stage[]
  }
});
