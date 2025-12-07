import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, Spin } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "@tanstack/react-router";
import { useCreateUser } from "../hooks/useUser";
import { useNotification } from "../contexts/NotificationContext";
import { useAuthStore } from "../store/authStore";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Button, Card, Input } from "../components/base";

const registerSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上である必要があります")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      "パスワードは英数字記号のうち2種類以上を含む必要があります"
    ),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const notification = useNotification();
  const { mutate: createUser, isPending } = useCreateUser();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    createUser(data, {
      onSuccess: (response) => {
        setAccessToken(response.accessToken);
        notification.success({
          title: "登録成功",
          description: `${response.user.name}さん、ようこそ！`,
          placement: "topRight",
        });
        navigate({ to: "/dashboard" });
      },
      onError: (error) => {
        notification.error({
          title: "登録失敗",
          description: error.message || "アカウントの作成に失敗しました",
          placement: "topRight",
        });
      },
    });
  };

  return (
    <AuthLayout>
      <Spin spinning={isPending} tip="アカウント作成中...">
        <Card title="新規登録" variant="elevated" style={{ width: 400 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Form.Item validateStatus={errors.name ? "error" : ""} help={errors.name?.message}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    prefix={<UserOutlined />}
                    placeholder="名前"
                    size="large"
                    disabled={isPending}
                  />
                )}
              />
            </Form.Item>

            <Form.Item validateStatus={errors.email ? "error" : ""} help={errors.email?.message}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    prefix={<MailOutlined />}
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
                    placeholder="パスワード（8文字以上、2種類以上）"
                    size="large"
                    disabled={isPending}
                  />
                )}
              />
            </Form.Item>

            <Form.Item>
              <Button
                variant="primary"
                htmlType="submit"
                size="large"
                block
                loading={isPending}
                disabled={isPending}
              >
                登録
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              すでにアカウントをお持ちですか？ <Link to="/login">ログイン</Link>
            </div>
          </form>
        </Card>
      </Spin>
    </AuthLayout>
  );
}
