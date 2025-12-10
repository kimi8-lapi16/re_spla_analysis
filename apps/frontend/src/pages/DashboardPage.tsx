import { Tabs } from "antd";
import { PointTransitionTab } from "../components/features/dashboard/PointTransitionTab";
import { VictoryRateTab } from "../components/features/dashboard/VictoryRateTab";
import { MainLayout } from "../components/layout/MainLayout";

export function DashboardPage() {
  const tabItems = [
    {
      key: "victoryRate",
      label: "勝率",
      children: <VictoryRateTab />,
    },
    {
      key: "pointTransition",
      label: "ポイント推移",
      children: <PointTransitionTab />,
    },
  ];

  return (
    <MainLayout>
      <Tabs
        items={tabItems}
        defaultActiveKey="victoryRate"
        style={{ height: "100%" }}
      />
    </MainLayout>
  );
}
