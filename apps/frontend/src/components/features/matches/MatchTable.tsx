import { Empty, Spin, Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { SortOrder } from "antd/es/table/interface";
import dayjs from "dayjs";
import { useMemo } from "react";
import type { MatchResponse } from "../../../api";
import { SearchMatchesRequest } from "../../../api";
import { useBattleTypes } from "../../../hooks/useBattleType";
import { useRules } from "../../../hooks/useRule";
import { useStages } from "../../../hooks/useStage";
import { useWeapons } from "../../../hooks/useWeapon";

type MatchTableProps = {
  matches?: MatchResponse[];
  isLoading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
  };
  sortBy?: SearchMatchesRequest.sortBy;
  sortOrder?: SearchMatchesRequest.sortOrder;
  onSortChange?: (
    sortBy: SearchMatchesRequest.sortBy,
    sortOrder: SearchMatchesRequest.sortOrder
  ) => void;
  selectedRowKeys?: string[];
  onSelectionChange?: (selectedKeys: string[], selectedRows: MatchResponse[]) => void;
};

type TableRow = MatchResponse & { key: string };

// sortBy enum values match the dataIndex names (gameDateTime, point, etc.)
// So we can use simple string mappings

// Map column dataIndex to API sortBy
const dataIndexToSortBy: Record<string, SearchMatchesRequest.sortBy | undefined> = {
  gameDateTime: SearchMatchesRequest.sortBy.GAME_DATE_TIME,
  point: SearchMatchesRequest.sortBy.POINT,
  weaponId: SearchMatchesRequest.sortBy.WEAPON_ID,
  stageId: SearchMatchesRequest.sortBy.STAGE_ID,
  ruleId: SearchMatchesRequest.sortBy.RULE_ID,
  battleTypeId: SearchMatchesRequest.sortBy.BATTLE_TYPE_ID,
  result: SearchMatchesRequest.sortBy.RESULT,
};

// Map API sortBy back to dataIndex for controlled sort display
const sortByToDataIndex: Record<SearchMatchesRequest.sortBy, string> = {
  [SearchMatchesRequest.sortBy.GAME_DATE_TIME]: "gameDateTime",
  [SearchMatchesRequest.sortBy.POINT]: "point",
  [SearchMatchesRequest.sortBy.WEAPON_ID]: "weaponId",
  [SearchMatchesRequest.sortBy.STAGE_ID]: "stageId",
  [SearchMatchesRequest.sortBy.RULE_ID]: "ruleId",
  [SearchMatchesRequest.sortBy.BATTLE_TYPE_ID]: "battleTypeId",
  [SearchMatchesRequest.sortBy.RESULT]: "result",
};

export function MatchTable({
  matches,
  isLoading,
  pagination,
  sortBy,
  sortOrder,
  onSortChange,
  selectedRowKeys,
  onSelectionChange,
}: MatchTableProps) {
  const { data: weapons } = useWeapons();
  const { data: stages } = useStages();
  const { data: rules } = useRules();
  const { data: battleTypes } = useBattleTypes();

  const weaponMap = useMemo(() => new Map(weapons?.map((w) => [w.id, w.name])), [weapons]);
  const stageMap = useMemo(() => new Map(stages?.map((s) => [s.id, s.name])), [stages]);
  const ruleMap = useMemo(() => new Map(rules?.map((r) => [r.id, r.name])), [rules]);
  const battleTypeMap = useMemo(
    () => new Map(battleTypes?.map((bt) => [bt.id, bt.name])),
    [battleTypes]
  );

  const tableData: TableRow[] = useMemo(
    () => matches?.map((match) => ({ ...match, key: match.id })) || [],
    [matches]
  );

  // Helper to get sortOrder for a column
  const getSortOrder = (dataIndex: string): SortOrder | undefined => {
    if (!sortBy) return undefined;
    const currentDataIndex = sortByToDataIndex[sortBy];
    if (currentDataIndex !== dataIndex) return undefined;
    return sortOrder === SearchMatchesRequest.sortOrder.ASC ? "ascend" : "descend";
  };

  const columns: ColumnsType<TableRow> = [
    {
      title: "日時",
      dataIndex: "gameDateTime",
      key: "gameDateTime",
      width: 150,
      sorter: true,
      sortOrder: getSortOrder("gameDateTime"),
      render: (value: string) => dayjs(value).format("YYYY/MM/DD HH:mm"),
    },
    {
      title: "ルール",
      dataIndex: "ruleId",
      key: "rule",
      width: 120,
      sorter: true,
      sortOrder: getSortOrder("ruleId"),
      render: (ruleId: number) => ruleMap.get(ruleId) || "-",
    },
    {
      title: "ステージ",
      dataIndex: "stageId",
      key: "stage",
      width: 150,
      sorter: true,
      sortOrder: getSortOrder("stageId"),
      render: (stageId: number) => stageMap.get(stageId) || "-",
    },
    {
      title: "ブキ",
      dataIndex: "weaponId",
      key: "weapon",
      width: 150,
      sorter: true,
      sortOrder: getSortOrder("weaponId"),
      render: (weaponId: number) => weaponMap.get(weaponId) || "-",
    },
    {
      title: "バトルタイプ",
      dataIndex: "battleTypeId",
      key: "battleType",
      width: 120,
      sorter: true,
      sortOrder: getSortOrder("battleTypeId"),
      render: (battleTypeId: number) => battleTypeMap.get(battleTypeId) || "-",
    },
    {
      title: "勝敗",
      dataIndex: "result",
      key: "result",
      width: 80,
      sorter: true,
      sortOrder: getSortOrder("result"),
      render: (result: string) => (result === "WIN" ? "勝ち" : "負け"),
    },
    {
      title: "ポイント",
      dataIndex: "point",
      key: "point",
      width: 100,
      sorter: true,
      sortOrder: getSortOrder("point"),
      render: (point: number | null) => point ?? "-",
    },
  ];

  const handleTableChange: TableProps<TableRow>["onChange"] = (_pagination, _filters, sorter) => {
    if (!onSortChange) return;
    // sorter can be an array for multi-column sort, but we only support single
    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    // Only handle when column header is clicked (column property exists)
    if (!singleSorter || !singleSorter.column) return;

    const field = String(singleSorter.field);
    const newSortBy = dataIndexToSortBy[field];
    if (!newSortBy) return;

    // If clicking same column, toggle order; if no order, default to desc
    const newSortOrder =
      singleSorter.order === "ascend"
        ? SearchMatchesRequest.sortOrder.ASC
        : SearchMatchesRequest.sortOrder.DESC;

    onSortChange(newSortBy, newSortOrder);
  };

  const rowSelection = onSelectionChange
    ? {
        selectedRowKeys,
        onChange: (keys: React.Key[], rows: TableRow[]) => {
          onSelectionChange(
            keys as string[],
            rows.map((row) => ({
              id: row.id,
              weaponId: row.weaponId,
              stageId: row.stageId,
              ruleId: row.ruleId,
              battleTypeId: row.battleTypeId,
              result: row.result,
              gameDateTime: row.gameDateTime,
              point: row.point,
            }))
          );
        },
      }
    : undefined;

  return (
    <Spin spinning={isLoading}>
      <Table
        dataSource={tableData}
        columns={columns}
        rowSelection={rowSelection}
        scroll={{ y: "calc(100vh - 488px)" }}
        locale={{
          emptyText: (
            <Empty description="試合データがありません" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ),
        }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false,
          onChange: pagination.onChange,
        }}
        onChange={handleTableChange}
      />
    </Spin>
  );
}
