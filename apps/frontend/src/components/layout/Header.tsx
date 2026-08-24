import { LogoutOutlined, MenuOutlined } from "@ant-design/icons";
import { Flex, Layout, Typography } from "antd";
import { semantic } from "../../theme";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../base";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  onLogout?: () => void;
  /** Shown only when navigation has moved into a drawer (compact widths). */
  showMenuButton?: boolean;
  onMenuClick?: () => void;
}

export const Header = ({ onLogout, showMenuButton, onMenuClick }: HeaderProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);

  const handleLogout = () => {
    clearAccessToken();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <AntHeader
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        background: `linear-gradient(135deg, ${semantic.surface.brand} 0%, ${semantic.surface.brandGradientEnd} 100%)`,
        padding: "0 16px",
        boxShadow: semantic.shadow.header,
      }}
    >
      <Flex align="center" gap="small" style={{ minWidth: 0 }}>
        {showMenuButton && (
          <Button
            intent="neutral"
            icon={<MenuOutlined />}
            aria-label="メニューを開く"
            onClick={onMenuClick}
          />
        )}
        <Text
          style={{
            color: semantic.text.inverse,
            // Scales down instead of wrapping out of the 64px header on narrow
            // screens, where it used to overflow behind the content.
            fontSize: "clamp(16px, 4vw, 24px)",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Splatoon Analysis
        </Text>
      </Flex>
      {isAuthenticated && (
        <Button intent="neutral" icon={<LogoutOutlined />} onClick={handleLogout}>
          ログアウト
        </Button>
      )}
    </AntHeader>
  );
};
