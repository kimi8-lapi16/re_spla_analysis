import { Layout } from "antd";

const { Footer: AntFooter } = Layout;

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter
      style={{
        textAlign: "center",
        background: "#f0f2f5",
        borderTop: "1px solid #d9d9d9",
        padding: "12px 50px",
        fontSize: "12px",
      }}
    >
      Splatoon Analysis ©{currentYear}
    </AntFooter>
  );
};
