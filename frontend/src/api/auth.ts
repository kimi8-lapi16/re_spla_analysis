import { atom } from "jotai";
import { Configuration, UserControllerApi } from "../../generated";

export const configAtom = atom(() => {
  return new Configuration({
    basePath: "http://localhost:4000",
    baseOptions: {
      credentials: 'include',
    }
  });
});

export const userApiAtom = atom((get) => {
  return new UserControllerApi(get(configAtom))
})
