import { Card, CardBody, CardHeader, Heading, Text } from "@yamada-ui/react";

export default function ProfilePage() {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Profile</Heading>
      </CardHeader>
      <CardBody>
        <Text>MailAddress: hoge@example.com</Text>
        <Text>Password: **********</Text>
      </CardBody>
    </Card>
  );
}
