import { Spin, Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { SortOrder as AntSortOrder } from "antd/es/table/interface";
import { useMemo } from "react";
import type { VictoryRateItem } from "../../../api";
import type { GroupByField, VictoryRateSortBy } from "../../../hooks/useAnalysis";
import type { TableState } from "../../../hooks/useTableState";

type VictoryRateTableProps = {
  data?: VictoryRateItem[];
  total: number;
  isLoading: boolean;
  groupBy: GroupByField[];
  tableState: TableState<VictoryRateSortBy>;
  onChange: (state: TableState<VictoryRateSortBy>) => void;
};

type TableRow = VictoryRateItem & { key: string };

// Map dataIndex to VictoryRateSortBy
const dataIndexToSortBy: Record<string, VictoryRateSortBy> = {
  ruleName: "ruleName",
  stageName: "stageName",
  weaponName: "weaponName",
  battleTypeName: "battleTypeName",
  totalCount: "totalCount",
  winCount: "winCount",
  victoryRate: "victoryRate",
};

export function VictoryRateTable({
  data,
  total,
  isLoading,
  groupBy,
  tableState,
  onChange,
}: VictoryRateTableProps) {
  const { page, pageSize, sortBy, sortOrder } = tableState;
  const tableData: TableRow[] = useMemo(() => {
    if (!data) return [];
    return data.map((item, index) => ({
      ...item,
      key: `${index}-${item.ruleName}-${item.stageName}-${item.weaponName}-${item.battleTypeName}`,
    }));
  }, [data]);

  // Helper to get sortOrder for a column
  const getSortOrder = (dataIndex: string): AntSortOrder | undefined => {
    const columnSortBy = dataIndexToSortBy[dataIndex];
    if (columnSortBy !== sortBy) return undefined;
    return sortOrder === "asc" ? "ascend" : "descend";
  };

  const columns: ColumnsType<TableRow> = useMemo(() => {
    const cols: ColumnsType<TableRow> = [];

    if (groupBy.includes("rule")) {
      cols.push({
        title: "ルール",
        dataIndex: "ruleName",
        key: "ruleName",
        width: 120,
        sorter: true,
        sortOrder: getSortOrder("ruleName"),
        render: (value: string) => value || "-",
      });
    }

    if (groupBy.includes("stage")) {
      cols.push({
        title: "ステージ",
        dataIndex: "stageName",
        key: "stageName",
        width: 150,
        sorter: true,
        sortOrder: getSortOrder("stageName"),
        render: (value: string) => value || "-",
      });
    }

    if (groupBy.includes("weapon")) {
      cols.push({
        title: "ブキ",
        dataIndex: "weaponName",
        key: "weaponName",
        width: 150,
        sorter: true,
        sortOrder: getSortOrder("weaponName"),
        render: (value: string) => value || "-",
      });
    }

    if (groupBy.includes("battleType")) {
      cols.push({
        title: "バトルタイプ",
        dataIndex: "battleTypeName",
        key: "battleTypeName",
        width: 120,
        sorter: true,
        sortOrder: getSortOrder("battleTypeName"),
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
        sorter: true,
        sortOrder: getSortOrder("totalCount"),
      },
      {
        title: "勝利数",
        dataIndex: "winCount",
        key: "winCount",
        width: 80,
        align: "right",
        sorter: true,
        sortOrder: getSortOrder("winCount"),
      },
      {
        title: "勝率",
        dataIndex: "victoryRate",
        key: "victoryRate",
        width: 100,
        align: "right",
        sorter: true,
        sortOrder: getSortOrder("victoryRate"),
        render: (value: number) => `${(value * 100).toFixed(1)}%`,
      }
    );

    return cols;
  }, [groupBy, sortBy, sortOrder]);

  const handleTableChange: TableProps<TableRow>["onChange"] = (pagination, _filters, sorter) => {
    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;

    // Determine new sort values
    let newSortBy = sortBy;
    let newSortOrder = sortOrder;
    if (singleSorter && singleSorter.column) {
      const field = String(singleSorter.field);
      const mappedSortBy = dataIndexToSortBy[field];
      if (mappedSortBy) {
        newSortBy = mappedSortBy;
        newSortOrder = singleSorter.order === "ascend" ? "asc" : "desc";
      }
    }

    // Determine new page (reset to 1 if sort changed)
    const sortChanged = newSortBy !== sortBy || newSortOrder !== sortOrder;
    const newPage = sortChanged ? 1 : (pagination.current ?? page);

    onChange({
      page: newPage,
      pageSize,
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    });
  };

  return (
    <Spin spinning={isLoading}>
      <Table
        dataSource={tableData}
        columns={columns}
        scroll={{ y: "calc(100vh - 376px)" }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: false,
        }}
        onChange={handleTableChange}
      />
    </Spin>
  );
}
