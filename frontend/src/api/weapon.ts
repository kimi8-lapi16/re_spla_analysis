import { useAtomValue } from "jotai";
import { useState } from "react";
import { weaponApiAtom } from "./config";

export function useGetWeapons() {
  const [loading, setLoading] = useState(true);
  const weaponApi = useAtomValue(weaponApiAtom);
  async function getWeapons() {
    setLoading(true);
    const { data } = await weaponApi.weaponsGet({ withCredentials: true });
    setLoading(false);
    return data.weapons;
  }
  return { loading, getWeapons }
}