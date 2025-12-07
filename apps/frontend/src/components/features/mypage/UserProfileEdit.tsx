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
            title: "更新が完了しました！",
            message: "ユーザー情報を更新しました",
            placement: "topRight",
          });
          onSuccess();
        },
        onError: (error: Error) => {
          notification.error({
            title: "更新に失敗しました",
            message: `更新に失敗しました: ${error.message}`,
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
            ユーザー情報
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
            label="名前"
            name="name"
            rules={[
              { required: true, message: "名前を入力してください" },
              { min: 1, message: "名前を入力してください" },
            ]}
          >
            <Input placeholder="名前を入力" />
          </Form.Item>

          <Form.Item
            label="メールアドレス"
            name="email"
            rules={[
              { required: true, message: "メールアドレスを入力してください" },
              { type: "email", message: "有効なメールアドレスを入力してください" },
            ]}
          >
            <Input placeholder="メールアドレスを入力" />
          </Form.Item>

          <Form.Item
            label="パスワード"
            name="password"
            rules={[{ min: 8, message: "パスワードは8文字以上である必要があります" }]}
          >
            <Input.Password placeholder="新しいパスワードを入力（任意）" />
          </Form.Item>

          <Flex gap={8} justify="flex-end">
            <Button variant="secondary" icon={<CloseOutlined />} onClick={onCancel}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={updateMutation.isPending}
            >
              保存
            </Button>
          </Flex>
        </Form>
      </Space>
    </Card>
  );
};
