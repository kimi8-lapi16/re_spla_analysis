import {
  Button,
  Center,
  FormControl,
  Input,
  PasswordInput,
  Stack,
} from "@yamada-ui/react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useCallback(() => {
    navigate("/analysis");
  }, [navigate]);
  return (
    <>
      <Center h="inherit" rounded="md" color="black" width={"100vw"}>
        <section>
          <FormControl>
            <Stack direction={{ base: "column", lg: "row" }}>
              <Input size="lg" type="email" placeholder="メールアドレス" />
              <PasswordInput size="lg" placeholder="パスワード" />
              <Button onClick={login}>ログイン</Button>
            </Stack>
          </FormControl>
        </section>
      </Center>
    </>
  );
}
