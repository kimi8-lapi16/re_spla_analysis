import { Layout, Typography } from "antd";
import { semantic } from "../../theme";

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter
      style={{
        textAlign: "center",
        borderTop: `1px solid ${semantic.border.default}`,
      }}
    >
      <Text type="secondary" style={{ fontSize: 12 }}>
        Splatoon Analysis ©{currentYear}
      </Text>
    </AntFooter>
  );
};
