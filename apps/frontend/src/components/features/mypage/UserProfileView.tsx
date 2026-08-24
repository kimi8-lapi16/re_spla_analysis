import { EditOutlined } from "@ant-design/icons";
import { Flex, Typography } from "antd";
import { Button, Card } from "../../base";

const { Text } = Typography;

interface UserProfileViewProps {
  name: string;
  email: string;
  onEdit: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Flex vertical gap={2}>
      <Text type="secondary" style={{ fontSize: 13 }}>
        {label}
      </Text>
      <Text>{value}</Text>
    </Flex>
  );
}

export const UserProfileView = ({ name, email, onEdit }: UserProfileViewProps) => {
  return (
    <Card
      title="ユーザー情報"
      extra={
        <Button intent="neutral" icon={<EditOutlined />} onClick={onEdit}>
          編集
        </Button>
      }
    >
      <Flex vertical gap="middle">
        <Field label="名前" value={name} />
        <Field label="メールアドレス" value={email} />
      </Flex>
    </Card>
  );
};
