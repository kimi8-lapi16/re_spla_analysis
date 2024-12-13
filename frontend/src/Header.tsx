import { Heading, Link } from "@yamada-ui/react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "./api/userApi";

interface HeaderProps {
  isLogin: boolean;
}

export default function Header(props: HeaderProps) {
  const { isLogin } = props;
  const navigate = useNavigate();
  const { logout } = useLogout();
  return (
    <section style={{ display: "flex", justifyContent: "start" }}>
      <Heading
        w="full"
        size="2xl"
        height="10vh"
        bgGradient="linear(to-l, #7928CA, #FF0080)"
        bgClip="text"
        isTruncated
      >
        Splatoon Analysis Application
      </Heading>
      {isLogin && (
        <Link
          style={{
            display: "inline-block",
            width: "fit-content",
            marginInline: "10px",
          }}
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          Logout
        </Link>
      )}
    </section>
  );
}
