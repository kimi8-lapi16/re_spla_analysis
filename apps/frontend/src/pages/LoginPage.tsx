import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "@tanstack/react-router";
import { Flex, Form, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Button, Card, Input } from "../components/base";
import { useNotification } from "../contexts/NotificationContext";
import { useLogin } from "../hooks/useAuth";
import { useAuthStore } from "../store/authStore";

const loginSchema = z.object({
  email: z.email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードは必須です"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const { Text } = Typography;

export function LoginPage() {
  const navigate = useNavigate();
  const notification = useNotification();
  const { mutate: login, isPending } = useLogin();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: (response) => {
        setAccessToken(response.accessToken);
        notification.success({
          title: "ログイン成功",
          description: "おかえりなさい！",
          placement: "topRight",
        });
        navigate({ to: "/dashboard" });
      },
      onError: (error) => {
        notification.error({
          title: "ログイン失敗",
          description: error.message || "メールアドレスまたはパスワードが正しくありません",
          placement: "topRight",
        });
      },
    });
  };

  return (
    <AuthLayout>
      <Card title="ログイン" tone="raised" style={{ width: "100%", maxWidth: 400 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form.Item validateStatus={errors.email ? "error" : ""} help={errors.email?.message}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<UserOutlined />}
                  placeholder="メールアドレス"
                  size="large"
                  disabled={isPending}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            validateStatus={errors.password ? "error" : ""}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  placeholder="パスワード"
                  size="large"
                  disabled={isPending}
                />
              )}
            />
          </Form.Item>

          <Form.Item>
            <Button
              intent="primary"
              htmlType="submit"
              size="large"
              block
              loading={isPending}
              disabled={isPending}
            >
              ログイン
            </Button>
          </Form.Item>

          <Flex justify="center">
            <Text>
              アカウントをお持ちでないですか？ <Link to="/register">新規登録</Link>
            </Text>
          </Flex>
        </form>
      </Card>
    </AuthLayout>
  );
}
