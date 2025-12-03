import { useNavigate } from "@tanstack/react-router";
import { Flex, Space, Typography } from "antd";
import { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { UserProfileEdit } from "../components/features/mypage/UserProfileEdit";
import { UserProfileView } from "../components/features/mypage/UserProfileView";
import { useCurrentUser } from "../hooks/useUser";

const { Title, Text } = Typography;

export const MyPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading } = useCurrentUser();

  const user = data?.user;

  if (isLoading) {
    return (
      <MainLayout>
        <Flex justify="center" align="center" style={{ padding: 48 }}>
          <Text>Loading...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <MainLayout>
      <Flex justify="center">
        <Space vertical size="large" style={{ width: "100%", maxWidth: 600 }}>
          <Title level={1}>My Page</Title>

          {!isEditing ? (
            <UserProfileView name={user.name} email={user.email} onEdit={() => setIsEditing(true)} />
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
