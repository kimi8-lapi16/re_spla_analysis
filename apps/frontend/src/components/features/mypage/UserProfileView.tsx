import { EditOutlined } from "@ant-design/icons";
import { Flex, Space, Typography } from "antd";
import { Button, Card } from "../../base";

const { Title, Text } = Typography;

interface UserProfileViewProps {
  name: string;
  email: string;
  onEdit: () => void;
}

export const UserProfileView = ({ name, email, onEdit }: UserProfileViewProps) => {
  return (
    <Card>
      <Space vertical size="large" style={{ width: "100%" }}>
        <Flex justify="space-between" align="center">
          <Title level={2} style={{ margin: 0 }}>
            User Information
          </Title>
          <Button variant="primary" icon={<EditOutlined />} onClick={onEdit}>
            Edit
          </Button>
        </Flex>

        <Space vertical size="middle" style={{ width: "100%" }}>
          <Space vertical size={4}>
            <Text strong type="secondary">
              Name
            </Text>
            <Text>{name}</Text>
          </Space>
          <Space vertical size={4}>
            <Text strong type="secondary">
              Email
            </Text>
            <Text>{email}</Text>
          </Space>
        </Space>
      </Space>
    </Card>
  );
};
