import { useNavigate } from "@tanstack/react-router";
import { Flex, Skeleton } from "antd";
import { useState } from "react";
import { Card } from "../components/base";
import { UserProfileEdit } from "../components/features/mypage/UserProfileEdit";
import { UserProfileView } from "../components/features/mypage/UserProfileView";
import { MainLayout } from "../components/layout/MainLayout";
import { PageHeader } from "../components/layout/PageHeader";
import { useCurrentUser } from "../hooks/useUser";
import { useAuthStore } from "../store/authStore";

/** Keeps the form readable instead of stretching inputs across the whole page. */
const CONTENT_MAX_WIDTH = 600;

export const MyPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading, isError } = useCurrentUser();
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);

  const user = data?.user;

  if (!isLoading && (!user || isError)) {
    clearAccessToken();
    navigate({ to: "/login" });
    return null;
  }

  return (
    <MainLayout>
      <Flex vertical gap="large" style={{ maxWidth: CONTENT_MAX_WIDTH }}>
        <PageHeader title="マイページ" />
        {isLoading || !user ? (
          // Skeleton rather than a spinner: the layout settles before the data
          // arrives, so nothing jumps once it does.
          <Card>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        ) : !isEditing ? (
          <UserProfileView name={user.name} email={user.email} onEdit={() => setIsEditing(true)} />
        ) : (
          <UserProfileEdit
            name={user.name}
            email={user.email}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        )}
      </Flex>
    </MainLayout>
  );
};
