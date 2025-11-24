import { Card } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { MainLayout } from "../components/layouts/MainLayout";
import { authUtils } from "../utils/auth";

export function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authUtils.removeAccessToken();
    navigate({ to: "/login" });
  };

  return (
    <MainLayout onLogout={handleLogout}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            minWidth: "400px",
          }}
        >
          <h1 style={{ fontSize: "32px", margin: 0 }}>Welcome Splatoon Analysis</h1>
        </Card>
      </div>
    </MainLayout>
  );
}
