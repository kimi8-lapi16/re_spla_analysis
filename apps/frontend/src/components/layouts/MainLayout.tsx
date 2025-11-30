import { Layout, Menu } from "antd";
import { type ReactNode, useState } from "react";
import { DashboardOutlined, MenuFoldOutlined, MenuUnfoldOutlined, TrophyOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { Header } from "../Header";
import { Footer } from "../Footer";

const { Sider, Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
  onLogout?: () => void;
}

export const MainLayout = ({ children, onLogout }: MainLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedKey = () => {
    if (location.pathname.startsWith('/matches')) {
      return 'matches';
    }
    if (location.pathname === '/dashboard') {
      return 'dashboard';
    }
    return 'dashboard';
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header onLogout={onLogout} />
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          style={{
            background: "#fff",
            borderRight: "1px solid #f0f0f0",
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
                label: "Dashboard",
                onClick: () => navigate({ to: "/dashboard" }),
              },
              {
                key: "matches",
                icon: <TrophyOutlined />,
                label: "Matches",
                onClick: () => navigate({ to: "/matches" }),
              },
            ]}
          />
        </Sider>
        <Layout>
          <Content
            style={{
              padding: "24px",
              minHeight: "280px",
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
