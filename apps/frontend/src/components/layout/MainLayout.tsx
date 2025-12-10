import { Layout, Menu } from "antd";
import { type ReactNode, useState } from "react";
import {
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAuthStore } from "../../store/authStore";

const { Sider, Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);

  const handleLogout = () => {
    clearAccessToken();
    navigate({ to: "/login" });
  };

  const getSelectedKey = () => {
    if (location.pathname.startsWith("/matches")) {
      return "matches";
    }
    if (location.pathname === "/my-page") {
      return "my-page";
    }
    if (location.pathname === "/dashboard") {
      return "dashboard";
    }
    return "dashboard";
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Header onLogout={handleLogout} />
      <Layout style={{ overflow: "hidden" }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          style={{
            background: "#fff",
            borderRight: "1px solid #f0f0f0",
            overflow: "auto",
          }}
        >
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            {collapsed ? (
              <MenuUnfoldOutlined
                onClick={() => setCollapsed(false)}
                style={{ fontSize: "18px", cursor: "pointer" }}
              />
            ) : (
              <MenuFoldOutlined
                onClick={() => setCollapsed(true)}
                style={{ fontSize: "18px", cursor: "pointer" }}
              />
            )}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={[
              {
                key: "dashboard",
                icon: <DashboardOutlined />,
                label: "ダッシュボード",
                onClick: () => navigate({ to: "/dashboard" }),
              },
              {
                key: "matches",
                icon: <TrophyOutlined />,
                label: "試合履歴",
                onClick: () => navigate({ to: "/matches" }),
              },
              {
                key: "my-page",
                icon: <UserOutlined />,
                label: "マイページ",
                onClick: () => navigate({ to: "/my-page" }),
              },
            ]}
          />
        </Sider>
        <Layout style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Content
            style={{
              padding: "24px",
              flex: 1,
              overflow: "hidden",
            }}
          >
            {children}
          </Content>
          <Footer />
        </Layout>
      </Layout>
    </Layout>
  );
};
