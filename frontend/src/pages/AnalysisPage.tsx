import { LineChart, LineProps } from "@yamada-ui/charts";
import { Tab, TabPanel, Tabs, VStack } from "@yamada-ui/react";
import { Table } from "@yamada-ui/table";
import { useMemo } from "react";

export default function AnalysisPage() {
  return (
    <Tabs variant="rounded-subtle">
      <Tab>ポイント推移</Tab>
      <Tab>勝率</Tab>
      <TabPanel>
        <PointTransitionContainer />
      </TabPanel>
      <TabPanel>
        <VictoryRateContainer />
      </TabPanel>
    </Tabs>
  );
}

function VictoryRateContainer() {
  const columns = [
    {
      header: "勝率",
      accessorKey: "rate",
    },
    {
      header: "ルール",
      accessorKey: "rule",
    },
    {
      header: "ステージ",
      accessorKey: "stage",
    },
    {
      header: "ブキ",
      accessorKey: "weapon",
    },
    {
      header: "バトル種類",
      accessorKey: "battleType",
    },
  ];
  const data = [
    {
      rate: "20.0%",
      rule: "ガチエリア",
      stage: "ユノハナ渓谷",
      weapon: "スプラシューター",
      battleType: "Xマッチ",
    },
    {
      rate: "21.2%",
      rule: "ガチエリア",
      stage: "ユノハナ渓谷",
      weapon: "スプラシューターコラボ",
      battleType: "Xマッチ",
    },
    {
      rate: "50.0%",
      rule: "ガチエリア",
      stage: "ユノハナ渓谷",
      weapon: "オーダーシューターレプリカ",
      battleType: "Xマッチ",
    },
    {
      rate: "100.0%",
      rule: "ガチエリア",
      stage: "ユノハナ渓谷",
      weapon: "ヒーローシューター",
      battleType: "Xマッチ",
    },
  ];
  return (
    <VStack>
      <Table variant="striped" columns={columns} data={data}></Table>
    </VStack>
  );
}

function PointTransitionContainer() {
  const data = useMemo(
    () => [
      {
        name: "ヤドン",
        HP: 90,
        こうげき: 65,
        ぼうぎょ: 65,
        とくこう: 40,
        とくぼう: 40,
        すばやさ: 15,
      },
      {
        name: "コダック",
        HP: 50,
        こうげき: 52,
        ぼうぎょ: 48,
        とくこう: 65,
        とくぼう: 50,
        すばやさ: 55,
      },
      {
        name: "カビゴン",
        HP: 160,
        こうげき: 110,
        ぼうぎょ: 65,
        とくこう: 65,
        とくぼう: 110,
        すばやさ: 30,
      },
    ],
    []
  );

  const series: LineProps[] = useMemo(
    () => [
      { dataKey: "HP", color: "green.500" },
      { dataKey: "こうげき", color: "red.500" },
      { dataKey: "ぼうぎょ", color: "blue.500" },
      { dataKey: "とくこう", color: "purple.500" },
      { dataKey: "とくぼう", color: "orange.500" },
      { dataKey: "すばやさ", color: "cyan.500" },
    ],
    []
  );
  return <LineChart data={data} series={series} dataKey="name" />;
}
