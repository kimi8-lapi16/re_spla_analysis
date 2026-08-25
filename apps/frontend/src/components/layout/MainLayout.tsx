import { Drawer, Grid, Layout, Menu } from "antd";
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
import { semantic } from "../../theme";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

interface MainLayoutProps {
  children: ReactNode;
}

const MENU_ITEMS = [
  { key: "dashboard", icon: <DashboardOutlined />, label: "ダッシュボード", to: "/dashboard" },
  { key: "matches", icon: <TrophyOutlined />, label: "試合履歴", to: "/matches" },
  { key: "my-page", icon: <UserOutlined />, label: "マイページ", to: "/my-page" },
] as const;

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);

  const screens = useBreakpoint();
  // Below lg the sider would take half a phone screen, so navigation moves into
  // a drawer opened from the header instead.
  const isCompact = !screens.lg;

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
    return "dashboard";
  };

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={[getSelectedKey()]}
      items={MENU_ITEMS.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
        onClick: () => {
          navigate({ to: item.to });
          setIsDrawerOpen(false);
        },
      }))}
    />
  );

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Header
        onLogout={handleLogout}
        showMenuButton={isCompact}
        onMenuClick={() => setIsDrawerOpen(true)}
      />
      <Layout style={{ overflow: "hidden" }}>
        {isCompact ? (
          <Drawer
            placement="left"
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            size={240}
            styles={{ body: { padding: 0 } }}
            title="メニュー"
          >
            {menu}
          </Drawer>
        ) : (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
            style={{
              borderRight: `1px solid ${semantic.border.subtle}`,
              overflow: "auto",
            }}
          >
            <div
              style={{
                padding: "16px",
                textAlign: "center",
                borderBottom: `1px solid ${semantic.border.subtle}`,
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
            {menu}
          </Sider>
        )}
        <Layout style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Content
            style={{
              padding: isCompact ? 16 : 24,
              flex: 1,
              overflow: "auto",
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
