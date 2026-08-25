import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Empty, Flex, Skeleton } from "antd";
import dayjs from "dayjs";
import type { PointTransitionItem } from "../../../api";
import { semantic } from "../../../theme";

// No Title or Legend plugin: the card heading names the series, and a legend for
// a single series is a box that says what the title already said.
ChartJS.register(CategoryScale, Filler, LinearScale, PointElement, LineElement, Tooltip);

/**
 * Height follows the viewport instead of being a fixed 400px, but stays bounded:
 * an aspect ratio alone makes the chart taller than the window on a wide screen.
 */
const CHART_HEIGHT = "clamp(220px, 34vh, 380px)";

type PointTransitionChartProps = {
  data?: PointTransitionItem[];
  isLoading: boolean;
};

export function PointTransitionChart({ data, isLoading }: PointTransitionChartProps) {
  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} title={false} />;
  }

  if (!data || data.length === 0) {
    return (
      <Flex justify="center" style={{ padding: "32px 0" }}>
        <Empty
          description="この条件で記録されたポイントがありません"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Flex>
    );
  }

  const lastIndex = data.length - 1;

  const chartData = {
    labels: data.map((item) => dayjs(item.gameDateTime).format("MM/DD HH:mm")),
    datasets: [
      {
        label: "ポイント",
        data: data.map((item) => item.point),
        borderColor: semantic.chart.line,
        backgroundColor: semantic.chart.fill,
        borderWidth: 2,
        fill: true,
        tension: 0.25,
        // Only the latest point gets a marker - a dot on every point turns the
        // line into a dotted rule and hides the shape.
        pointRadius: data.map((_, index) => (index === lastIndex ? 5 : 0)),
        pointHoverRadius: 5,
        pointBackgroundColor: semantic.chart.point,
        pointBorderColor: semantic.surface.base,
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        displayColors: false,
        callbacks: {
          label: (context: { parsed: { y: number | null } }) =>
            context.parsed.y === null ? "" : `${context.parsed.y.toLocaleString("ja-JP")} pt`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0, autoSkipPadding: 24, color: semantic.text.tertiary },
      },
      y: {
        beginAtZero: false,
        border: { display: false },
        grid: { color: semantic.chart.grid },
        ticks: { color: semantic.text.tertiary },
      },
    },
  };

  return (
    <div style={{ height: CHART_HEIGHT }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
