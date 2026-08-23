import { Flex, Tabs, Typography } from "antd";
import { PointTransitionTab } from "../components/features/dashboard/PointTransitionTab";
import { SummaryCards } from "../components/features/dashboard/SummaryCards";
import { VictoryRateTab } from "../components/features/dashboard/VictoryRateTab";
import { MainLayout } from "../components/layout/MainLayout";

const { Title } = Typography;

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
      <Flex vertical gap="large" style={{ height: "100%", minHeight: 0 }}>
        <Title level={2} style={{ margin: 0 }}>
          ダッシュボード
        </Title>
        <SummaryCards />
        <Flex vertical style={{ flex: 1, minHeight: 0 }}>
          <Tabs items={tabItems} defaultActiveKey="victoryRate" style={{ height: "100%" }} />
        </Flex>
      </Flex>
    </MainLayout>
  );
}
