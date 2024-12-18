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
  const doSubmit = useCallback(async () => {
    // TODO: ちゃんとエラーメッセージ出す
    if (!name || !mailAddress || !password) {
      console.error("どっちも入力必須やで");
      return;
    }
    try {
      await signUp({ name, mailAddress, password });
    } catch (e) {
      console.error(e);
    }
    navigate("/analysis");
  }, [mailAddress, name, navigate, password, signUp]);
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
                style={{ pointerEvents: "auto" }}
              />
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
              <Button onClick={doSubmit} style={{ pointerEvents: "auto" }}>
                会員登録
              </Button>
            </Stack>
          </FormControl>
        </section>
      </Center>
    </>
  );
}
