import { useNavigate } from "@tanstack/react-router";
import { Flex, Space, Spin, Typography } from "antd";
import { useState } from "react";
import { UserProfileEdit } from "../components/features/mypage/UserProfileEdit";
import { UserProfileView } from "../components/features/mypage/UserProfileView";
import { MainLayout } from "../components/layout/MainLayout";
import { useCurrentUser } from "../hooks/useUser";
import { useAuthStore } from "../store/authStore";

const { Title } = Typography;

export const MyPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading, isError } = useCurrentUser();
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);

  const user = data?.user;

  if (isLoading) {
    return (
      <MainLayout>
        <Flex justify="center" align="center" style={{ height: "600px" }}>
          <Spin />
        </Flex>
      </MainLayout>
    );
  }

  if (!user || isError) {
    clearAccessToken();
    navigate({ to: "/login" });
    return null;
  }

  return (
    <MainLayout>
      <Flex justify="center">
        <Space vertical size="large" style={{ width: "100%", maxWidth: 600 }}>
          <Title level={1}>マイページ</Title>
          {!isEditing ? (
            <UserProfileView
              name={user.name}
              email={user.email}
              onEdit={() => setIsEditing(true)}
            />
          ) : (
            <UserProfileEdit
              name={user.name}
              email={user.email}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          )}
        </Space>
      </Flex>
    </MainLayout>
  );
};
