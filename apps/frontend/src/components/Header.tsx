import { Layout } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { authUtils } from "../utils/auth";
import { Button } from "./ui";
import { colors } from "../theme";

const { Header: AntHeader } = Layout;

interface HeaderProps {
  onLogout?: () => void;
}

export const Header = ({ onLogout }: HeaderProps) => {
  const isAuthenticated = authUtils.isAuthenticated();

  const handleLogout = () => {
    authUtils.removeAccessToken();
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
          Logout
        </Button>
      )}
    </AntHeader>
  );
};
