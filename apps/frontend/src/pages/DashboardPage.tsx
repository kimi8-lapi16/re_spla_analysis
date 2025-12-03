import { Card } from "antd";
import { MainLayout } from "../components/layout/MainLayout";

export function DashboardPage() {
  return (
    <MainLayout>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            minWidth: "400px",
          }}
        >
          <h1 style={{ fontSize: "32px", margin: 0 }}>Welcome Splatoon Analysis</h1>
        </Card>
      </div>
    </MainLayout>
  );
}
