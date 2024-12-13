import {
  Button,
  Center,
  FormControl,
  Input,
  PasswordInput,
  Stack,
} from "@yamada-ui/react";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin, useSignUp } from "../api/userApi";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mailAddress, setMailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { login } = useLogin();
  const { signUp } = useSignUp();
  const doLogin = useCallback(async () => {
    if (!name || !mailAddress || !password) {
      console.error("どっちも入力必須やで");
      return;
    }
    try {
      await login({ mailAddress, password });
      await signUp({ name, mailAddress, password });
    } catch (e) {
      console.error(e);
    }
    navigate("/analysis");
  }, [login, mailAddress, name, navigate, password, signUp]);
  return (
    <>
      <Center h="inherit" rounded="md" color="black" width={"100vw"}>
        <section>
          <FormControl>
            <Stack direction={{ base: "column", lg: "row" }}>
              <Input
                size="lg"
                type="text"
                placeholder="ユーザー名"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                }}
              />
              <Input
                size="lg"
                type="email"
                placeholder="メールアドレス"
                value={mailAddress}
                onChange={(event) => {
                  setMailAddress(event.target.value);
                }}
              />
              <PasswordInput
                size="lg"
                placeholder="パスワード"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
              <Button onClick={doLogin}>ログイン</Button>
              <Link to="/signUp">会員登録はこちらから</Link>
            </Stack>
          </FormControl>
        </section>
      </Center>
    </>
  );
}
