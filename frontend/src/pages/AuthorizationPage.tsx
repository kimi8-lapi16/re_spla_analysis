import { AiryIdent, Button, Center, Flip } from "@yamada-ui/react";
import { useState } from "react";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";

export default function AuthorizationPage() {
  const [value, onChange] = useState<AiryIdent>("from");
  return (
    <Center
      h="inherit"
      rounded="md"
      color="black"
      width={"100vw"}
      style={{ flexDirection: "column" }}
    >
      <Flip
        value={value}
        from={<LoginPage />}
        to={<SignUpPage />}
        style={{ pointerEvents: "none" }}
      />
      <Button
        onClick={() => onChange(value === "from" ? "to" : "from")}
        style={{ marginTop: "100px" }}
        variant="ghost"
      >
        {value === "from" && (
          <span>アカウントをお持ちでない方はこちらから</span>
        )}
        {value === "to" && <span>ログインへ</span>}
      </Button>
    </Center>
  );
}
