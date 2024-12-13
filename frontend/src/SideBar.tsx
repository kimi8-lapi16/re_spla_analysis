import { Flex, Separator } from "@yamada-ui/react";
import { Link } from "react-router-dom";

export default function SideBar() {
  return (
    <section>
      <Flex direction="column" gap="md">
        <SideBarElement key="analysis" name="Analysis" to="analysis" />
        <SideBarElement key="search" name="Search" to="search" />
        <SideBarElement key="profile" name="Profile" to="profile" />
      </Flex>
    </section>
  );
}

interface SideBarElementProps {
  name: string;
  to: string;
}

function SideBarElement(props: SideBarElementProps) {
  const { name, to } = props;
  return (
    <>
      <Link to={to}>{name}</Link>
      <Separator variant="solid" />
    </>
  );
}
