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
  const [errorMessage, setErrorMessage] = useState("");
  const doLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        await login({ mailAddress, password });
        navigate("/analysis");
      } catch (e) {
        setErrorMessage(
          "ログインに失敗しました。<br/>入力内容をお確かめのうえ、再度お試しください。"
        );
        console.error(e);
      }
    },
    [login, mailAddress, navigate, password]
  );
  return (
    <>
      <Center h="inherit" rounded="md" color="black" width={"100vw"}>
        <section
          style={{
            width: "100%",
            display: "grid",
            justifyContent: "center",
            justifyItems: "center",
            alignContent: "center",
          }}
        >
          <p
            dangerouslySetInnerHTML={{ __html: errorMessage }}
            style={{ color: "red", marginBlock: "10px" }}
          />
          <form onSubmit={doLogin} style={{ width: "300px" }}>
            <Stack direction={{ base: "column", lg: "row" }}>
              <FormControl
                label="メールアドレス"
                errorMessage="メールアドレスは必須です。"
              >
                <Input
                  isRequired
                  size="lg"
                  type="email"
                  value={mailAddress}
                  onChange={(event) => {
                    setMailAddress(event.target.value);
                  }}
                  style={{ pointerEvents: "auto" }}
                />
              </FormControl>
              <FormControl
                label="パスワード"
                errorMessage="パスワードは必須です。"
              >
                <PasswordInput
                  isRequired
                  size="lg"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                  style={{ pointerEvents: "auto" }}
                />
              </FormControl>
              <Button type="submit" style={{ pointerEvents: "auto" }}>
                ログイン
              </Button>
            </Stack>
          </form>
        </section>
      </Center>
    </>
  );
}
