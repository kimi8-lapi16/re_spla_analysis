import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
} from "@yamada-ui/react";
import { useAtom } from "jotai";
import { userAtom } from "../store/user";

export default function ProfilePage() {
  const [user, refresh] = useAtom(userAtom);
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Profile</Heading>
      </CardHeader>
      <CardBody>
        <Text>Name: {user.name}</Text>
        <Text>MailAddress: {user.mailAddress}</Text>
        <Text>Password: **********</Text>
      </CardBody>
      <Button onClick={refresh}>Refresh</Button>
    </Card>
  );
}
