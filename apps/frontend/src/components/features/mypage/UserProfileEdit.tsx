import { CloseOutlined, SaveOutlined } from "@ant-design/icons";
import { Flex, Form, Space, Typography } from "antd";
import type { UpdateUser } from "../../../api";
import { useNotification } from "../../../contexts/NotificationContext";
import { useUpdateUser } from "../../../hooks/useUser";
import { Button, Card, Input } from "../../base";

const { Title } = Typography;

interface UserProfileEditProps {
  name: string;
  email: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const UserProfileEdit = ({ name, email, onCancel, onSuccess }: UserProfileEditProps) => {
  const [form] = Form.useForm();
  const notification = useNotification();
  const updateMutation = useUpdateUser();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const filteredValues: Partial<UpdateUser> = {};

      for (const [key, value] of Object.entries(values)) {
        if (value !== "" && value !== undefined && value !== null && typeof value === "string") {
          if (key === "name") {
            filteredValues.name = value;
          } else if (key === "email") {
            filteredValues.email = value;
          } else if (key === "password") {
            filteredValues.password = value;
          }
        }
      }

      updateMutation.mutate(filteredValues, {
        onSuccess: () => {
          notification.success({
            title: "Success",
            message: "User information updated successfully",
            placement: "topRight",
          });
          onSuccess();
        },
        onError: (error: Error) => {
          notification.error({
            title: "Update Failed",
            message: `Failed to update user: ${error.message}`,
            placement: "topRight",
          });
        },
      });
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Card>
      <Space vertical size="large" style={{ width: "100%" }}>
        <Flex justify="space-between" align="center">
          <Title level={2} style={{ margin: 0 }}>
            User Information
          </Title>
        </Flex>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name,
            email,
            password: "",
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please input your name!" },
              { min: 1, message: "Name must not be empty" },
            ]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ min: 8, message: "Password must be at least 8 characters" }]}
          >
            <Input.Password placeholder="Enter new password (optional)" />
          </Form.Item>

          <Flex gap={8} justify="flex-end">
            <Button variant="secondary" icon={<CloseOutlined />} onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={updateMutation.isPending}
            >
              Save
            </Button>
          </Flex>
        </Form>
      </Space>
    </Card>
  );
};
