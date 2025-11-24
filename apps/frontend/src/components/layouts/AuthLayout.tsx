import { Layout } from "antd";
import { type ReactNode } from "react";
import { Header } from "../Header";
import { Footer } from "../Footer";

const { Content } = Layout;

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header />
      <Content
        style={{
          padding: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </Content>
      <Footer />
    </Layout>
  );
};
