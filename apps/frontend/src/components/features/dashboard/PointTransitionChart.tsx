import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Spin, Empty, Flex } from "antd";
import dayjs from "dayjs";
import type { PointTransitionItem } from "../../../api";

// Chart.js の登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CHART_HEIGHT = 400;

type PointTransitionChartProps = {
  data?: PointTransitionItem[];
  isLoading: boolean;
  ruleName?: string;
};

export function PointTransitionChart({
  data,
  isLoading,
  ruleName,
}: PointTransitionChartProps) {
  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ height: CHART_HEIGHT }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Empty
        description="ポイントデータがありません"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const chartData = {
    labels: data.map((item) =>
      dayjs(item.gameDateTime).format("MM/DD HH:mm")
    ),
    datasets: [
      {
        label: ruleName ? `${ruleName} ポイント` : "ポイント",
        data: data.map((item) => item.point),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "ポイント推移",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div style={{ height: CHART_HEIGHT }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
