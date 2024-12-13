import { useAtomValue } from "jotai";
import { useState } from "react";
import { userApiAtom } from "./config";

export function useLogin() {
  const [loading, setLoading] = useState(true);
  const userApi = useAtomValue(userApiAtom);
  const login = async (param: { mailAddress: string, password: string }) => {
    setLoading(true);
    const { mailAddress, password} = param;
    await userApi.usersLoginPost({input: { mailAddress, password }});
    setLoading(false);
  };
  return { loading, login }
}

export function useSignUp() {
  const [loading, setLoading] = useState(true);
  const userApi = useAtomValue(userApiAtom);
  const signUp = async (param: { name: string, mailAddress: string, password: string }) => {
    setLoading(true);
    const { name, mailAddress, password} = param;
    await userApi.usersSignUpPost({input: { name, mailAddress, password }});
    setLoading(false);
  };
  return { loading, signUp }
}

export function useGetUser() {
  const [loading, setLoading] = useState(true);
  const userApi = useAtomValue(userApiAtom);
  async function getUser() {
    setLoading(true);
    const { data } = await userApi.usersGet({ withCredentials: true });
    setLoading(false);
    return data;  
  }
  return { loading, getUser }
}

export function useLogout() {
  const userApi = useAtomValue(userApiAtom);
  async function logout() {
    await userApi.usersLogoutPost({ withCredentials: true });
  }
  return { logout };
}