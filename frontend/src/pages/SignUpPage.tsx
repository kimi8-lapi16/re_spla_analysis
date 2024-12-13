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
import { useSignUp } from "../api/userApi";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [mailAddress, setMailAddress] = useState("");
  const [password, setPassword] = useState("");
  const { signUp } = useSignUp();
  const [errorMessage, setErrorMessage] = useState("");
  const doSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        await signUp({ name, mailAddress, password });
        navigate("/analysis");
      } catch (e) {
        setErrorMessage(
          "会員登録に失敗しました。<br/>入力内容をお確かめのうえ、再度お試しください。"
        );
        console.error(e);
      }
    },
    [mailAddress, name, navigate, password, signUp]
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
          <form onSubmit={doSubmit} style={{ width: "300px" }}>
            <Stack direction={{ base: "column", lg: "row" }}>
              <FormControl
                label="ユーザー名"
                errorMessage="ユーザー名は必須です"
              >
                <Input
                  size="lg"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                  }}
                  required
                  style={{ pointerEvents: "auto" }}
                />
              </FormControl>
              <FormControl
                label="メールアドレス"
                errorMessage="メールアドレスは必須です"
              >
                <Input
                  size="lg"
                  type="email"
                  value={mailAddress}
                  onChange={(event) => {
                    setMailAddress(event.target.value);
                  }}
                  required
                  style={{ pointerEvents: "auto" }}
                />
              </FormControl>
              <FormControl
                label="パスワード"
                errorMessage="パスワードは必須です"
              >
                <PasswordInput
                  size="lg"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                  required
                  style={{ pointerEvents: "auto" }}
                />
              </FormControl>
              <Button type="submit" style={{ pointerEvents: "auto" }}>
                会員登録
              </Button>
            </Stack>
          </form>
        </section>
      </Center>
    </>
  );
}
