import { Flex, Tabs, Typography } from "antd";
import { PointTransitionTab } from "../components/features/dashboard/PointTransitionTab";
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
      <Flex vertical gap={24}>
        <Title level={2} style={{ margin: 0 }}>
          ダッシュボード
        </Title>
        <Tabs items={tabItems} defaultActiveKey="victoryRate" />
      </Flex>
    </MainLayout>
  );
}
