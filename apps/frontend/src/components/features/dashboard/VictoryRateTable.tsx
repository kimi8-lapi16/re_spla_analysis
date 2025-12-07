import { Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import type { VictoryRateItem } from "../../../api";
import type { GroupByField } from "../../../hooks/useAnalysis";

type VictoryRateTableProps = {
  data?: VictoryRateItem[];
  isLoading: boolean;
  groupBy: GroupByField[];
};

type TableRow = VictoryRateItem & { key: string };

export function VictoryRateTable({ data, isLoading, groupBy }: VictoryRateTableProps) {
  const tableData: TableRow[] = useMemo(() => {
    if (!data) return [];
    return data.map((item, index) => ({
      ...item,
      key: `${index}-${item.ruleName}-${item.stageName}-${item.weaponName}-${item.battleTypeName}`,
    }));
  }, [data]);

  const columns: ColumnsType<TableRow> = useMemo(() => {
    const cols: ColumnsType<TableRow> = [];

    if (groupBy.includes("rule")) {
      cols.push({
        title: "ルール",
        dataIndex: "ruleName",
        key: "ruleName",
        width: 120,
        render: (value: string) => value || "-",
      });
    }

    if (groupBy.includes("stage")) {
      cols.push({
        title: "ステージ",
        dataIndex: "stageName",
        key: "stageName",
        width: 150,
        render: (value: string) => value || "-",
      });
    }

    if (groupBy.includes("weapon")) {
      cols.push({
        title: "ブキ",
        dataIndex: "weaponName",
        key: "weaponName",
        width: 150,
        render: (value: string) => value || "-",
      });
    }

    if (groupBy.includes("battleType")) {
      cols.push({
        title: "バトルタイプ",
        dataIndex: "battleTypeName",
        key: "battleTypeName",
        width: 120,
        render: (value: string) => value || "-",
      });
    }

    cols.push(
      {
        title: "試合数",
        dataIndex: "totalCount",
        key: "totalCount",
        width: 80,
        align: "right",
      },
      {
        title: "勝利数",
        dataIndex: "winCount",
        key: "winCount",
        width: 80,
        align: "right",
      },
      {
        title: "勝率",
        dataIndex: "victoryRate",
        key: "victoryRate",
        width: 100,
        align: "right",
        render: (value: number) => `${(value * 100).toFixed(1)}%`,
      }
    );

    return cols;
  }, [groupBy]);

  return (
    <Spin spinning={isLoading}>
      <Table
        dataSource={tableData}
        columns={columns}
        scroll={{ y: "calc(100vh - 400px)" }}
        pagination={{ pageSize: 20, showSizeChanger: false }}
      />
    </Spin>
  );
}
