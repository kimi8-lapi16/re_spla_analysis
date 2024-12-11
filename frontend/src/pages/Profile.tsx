import { Card, CardBody, CardHeader, Heading, Text } from "@yamada-ui/react";
import { useAtom } from "jotai";
import { userAtom } from "../store/user";

export default function ProfilePage() {
  const [user] = useAtom(userAtom);
  return (
    <Card
      style={{
        display: "flex",
        justifyContent: "center",
        width: "90vw",
        margin: "5vw",
      }}
    >
      <CardHeader>
        <Heading size="md">Profile</Heading>
      </CardHeader>
      <CardBody>
        <Text>Name: {user.name}</Text>
        <Text>MailAddress: {user.mailAddress}</Text>
        <Text>Password: {user.password}</Text>
      </CardBody>
    </Card>
  );
}
