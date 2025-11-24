import { Layout, Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { authUtils } from '../utils/auth';

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#001529',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
        }}
      >
        Splatoon Analysis
      </div>
      {isAuthenticated && (
        <Button
          type="primary"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          danger
        >
          Logout
        </Button>
      )}
    </AntHeader>
  );
};
