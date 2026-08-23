import { LogoutOutlined } from "@ant-design/icons";
import { Layout, Typography } from "antd";
import { semantic } from "../../theme";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../base";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  onLogout?: () => void;
}

export const Header = ({ onLogout }: HeaderProps) => {
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
        background: `linear-gradient(135deg, ${semantic.surface.brand} 0%, ${semantic.surface.brandGradientEnd} 100%)`,
        padding: "0 24px",
        boxShadow: semantic.shadow.header,
      }}
    >
      <Text
        style={{
          color: semantic.text.inverse,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-0.5px",
        }}
      >
        Splatoon Analysis
      </Text>
      {isAuthenticated && (
        <Button intent="neutral" icon={<LogoutOutlined />} onClick={handleLogout}>
          ログアウト
        </Button>
      )}
    </AntHeader>
  );
};
