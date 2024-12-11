import { atomWithRefresh } from "jotai/utils";
import { Weapon } from "../../generated";
import { useGetWeapons } from "../api/weapon";

export const weaponAtom = atomWithRefresh(async () => {
  try {
    const { getWeapons } = useGetWeapons();
    const weapons = await getWeapons();
    return weapons;
  } catch(e) {
    console.error(e)
    return [] as Weapon[]
  }
});