import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Form, Input, Button, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { useLogin } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import { authUtils } from '../utils/auth';
import { AuthLayout } from '../components/layouts/AuthLayout';

const loginSchema = z.object({
  email: z.string().min(1, 'メールアドレスは必須です').email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードは必須です'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const notification = useNotification();
  const { mutate: login, isPending } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: (response) => {
        authUtils.setAccessToken(response.accessToken);
        notification.success({
          title: 'ログイン成功',
          description: 'おかえりなさい！',
          placement: 'topRight',
        });
        navigate({ to: '/dashboard' });
      },
      onError: (error) => {
        notification.error({
          title: 'ログイン失敗',
          description: error.message || 'メールアドレスまたはパスワードが正しくありません',
          placement: 'topRight',
        });
      },
    });
  };

  return (
    <AuthLayout>
      <Spin spinning={isPending} tip="ログイン中...">
        <Card title="ログイン" style={{ width: 400 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Form.Item
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.message}
            >
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
              validateStatus={errors.password ? 'error' : ''}
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
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={isPending}
                disabled={isPending}
              >
                ログイン
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              アカウントをお持ちでないですか？{' '}
              <Button type="link" onClick={() => navigate({ to: '/register' })}>
                新規登録
              </Button>
            </div>
          </form>
        </Card>
      </Spin>
    </AuthLayout>
  );
}
