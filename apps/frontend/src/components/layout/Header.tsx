import { LogoutOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import { colors } from "../../theme/colors";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../base";

const { Header: AntHeader } = Layout;

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
        background: `linear-gradient(135deg, ${colors.primary[700]} 0%, ${colors.primary[600]} 100%)`,
        padding: "0 24px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div
        style={{
          color: colors.text.inverse,
          fontSize: "24px",
          fontWeight: "700",
          letterSpacing: "-0.5px",
        }}
      >
        Splatoon Analysis
      </div>
      {isAuthenticated && (
        <Button
          variant="danger"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{
            fontWeight: 500,
          }}
        >
          ログアウト
        </Button>
      )}
    </AntHeader>
  );
};
