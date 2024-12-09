import { Heading, Link } from "@yamada-ui/react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  return (
    <section style={{ display: "flex" }}>
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
      <Link
        style={{
          display: "inline-block",
          width: "fit-content",
          marginRight: "0px",
        }}
        onClick={() => navigate("/login")}
      >
        Logout
      </Link>
    </section>
  );
}
