import { atom } from "jotai";
import { Configuration, RuleControllerApi, StageControllerApi, UserControllerApi, WeaponControllerApi } from "../../generated";

export const configAtom = atom(() => {
  return new Configuration({
    basePath: "http://localhost:4000",
    baseOptions: {
      credentials: 'include'
    }
  });
});

export const userApiAtom = atom((get) => {
  return new UserControllerApi(get(configAtom));
})

export const stageApiAtom = atom((get) => {
  return new StageControllerApi(get(configAtom));
});

export const ruleApiAtom = atom((get) => {
  return new RuleControllerApi(get(configAtom));
});

export const weaponApiAtom = atom((get) => {
  return new WeaponControllerApi(get(configAtom));
});