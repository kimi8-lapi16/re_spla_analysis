import {
  Button,
  Center,
  FormControl,
  Input,
  PasswordInput,
  Stack,
} from "@yamada-ui/react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../api/userApi";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mailAddress, setMailAddress] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useLogin();
  const doLogin = useCallback(async () => {
    if (!mailAddress || !password) {
      console.error("どっちも入力必須やで");
      return;
    }
    try {
      await login({ mailAddress, password });
    } catch (e) {
      console.error(e);
    }
    navigate("/analysis");
  }, [login, mailAddress, navigate, password]);
  return (
    <>
      <Center h="inherit" rounded="md" color="black" width={"100vw"}>
        <section>
          <FormControl>
            <Stack direction={{ base: "column", lg: "row" }}>
              <Input
                size="lg"
                type="email"
                placeholder="メールアドレス"
                value={mailAddress}
                onChange={(event) => {
                  setMailAddress(event.target.value);
                }}
                style={{ pointerEvents: "auto" }}
              />
              <PasswordInput
                size="lg"
                placeholder="パスワード"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                style={{ pointerEvents: "auto" }}
              />
              <Button onClick={doLogin} style={{ pointerEvents: "auto" }}>
                ログイン
              </Button>
            </Stack>
          </FormControl>
        </section>
      </Center>
    </>
  );
}
