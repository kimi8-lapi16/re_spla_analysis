import { LineChart, LineProps } from "@yamada-ui/charts";
import { useMemo } from "react";

export default function AnalysisPage() {
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
