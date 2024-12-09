import { atomWithRefresh } from "jotai/utils";
import { User } from "../../generated";
import { useGetUser } from "../api/userApi";

export const userAtom = atomWithRefresh(async (): Promise<User> => {
  const { getUser } = useGetUser();
  try {
    return await getUser();
  } catch(e) {
    console.error(e)
    return {} as User
  }
});
