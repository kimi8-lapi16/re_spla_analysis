import { PlusOutlined } from "@ant-design/icons";
import { Empty, Flex, Spin, Table, Typography } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { SortOrder } from "antd/es/table/interface";
import dayjs from "dayjs";
import { useMemo } from "react";
import type { MatchResponse } from "../../../api";
import { SearchMatchesRequest } from "../../../api";
import { Button } from "../../base";
import { MatchResultTag } from "./MatchResultTag";
import { useBattleTypes } from "../../../hooks/useBattleType";
import { useRules } from "../../../hooks/useRule";
import { useStages } from "../../../hooks/useStage";
import { useWeapons } from "../../../hooks/useWeapon";

export type MatchTableState = {
  page: number;
  sortBy?: SearchMatchesRequest.sortBy;
  sortOrder?: SearchMatchesRequest.sortOrder;
};

type MatchTableProps = {
  matches?: MatchResponse[];
  isLoading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  sortBy?: SearchMatchesRequest.sortBy;
  sortOrder?: SearchMatchesRequest.sortOrder;
  onTableChange: (state: MatchTableState) => void;
  /** Drives which empty state is shown: no data at all, or none matching. */
  hasActiveFilters: boolean;
  onClearFilters?: () => void;
  onCreateMatch: () => void;
  selectedRowKeys?: string[];
  onSelectionChange?: (selectedKeys: string[], selectedRows: MatchResponse[]) => void;
};

type TableRow = MatchResponse & { key: string };

// sortBy enum values match the dataIndex names (gameDateTime, point, etc.)
// So we can use simple string mappings

const { Text } = Typography;

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
  onTableChange,
  hasActiveFilters,
  onClearFilters,
  onCreateMatch,
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
      width: 90,
      sorter: true,
      sortOrder: getSortOrder("result"),
      render: (result: string) => <MatchResultTag result={result} />,
    },
    {
      title: "ポイント",
      dataIndex: "point",
      key: "point",
      width: 100,
      align: "right",
      sorter: true,
      sortOrder: getSortOrder("point"),
      render: (point: number | null) =>
        point === null ? "-" : <Text style={{ fontVariantNumeric: "tabular-nums" }}>{point}</Text>,
    },
  ];

  // antd calls this for both pagination and sorting changes, and it always reports the
  // currently active sorter. Sorting and paging must therefore be resolved together:
  // handling them separately made a page change also look like a sort change and reset
  // the page back to 1.
  const handleTableChange: TableProps<TableRow>["onChange"] = (
    nextPagination,
    _filters,
    sorter
  ) => {
    // sorter can be an array for multi-column sort, but we only support single
    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;

    let newSortBy = sortBy;
    let newSortOrder = sortOrder;
    // column is only set while a sorter is active
    if (singleSorter?.column) {
      const mappedSortBy = dataIndexToSortBy[String(singleSorter.field)];
      if (mappedSortBy) {
        newSortBy = mappedSortBy;
        newSortOrder =
          singleSorter.order === "ascend"
            ? SearchMatchesRequest.sortOrder.ASC
            : SearchMatchesRequest.sortOrder.DESC;
      }
    }

    const sortChanged = newSortBy !== sortBy || newSortOrder !== sortOrder;
    const newPage = sortChanged ? 1 : (nextPagination.current ?? pagination.current);

    onTableChange({ page: newPage, sortBy: newSortBy, sortOrder: newSortOrder });
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
    // `flex-table-container` (index.css) makes the table body the flexible part,
    // so the scroll area grows and shrinks with the viewport and with the filter
    // panel. Do not replace this with a `calc(100vh - N)` height: N encodes
    // whatever happened to be above the table on the day it was written.
    <Flex vertical className="flex-table-container">
      <Spin spinning={isLoading}>
        <Table
          dataSource={tableData}
          columns={columns}
          rowSelection={rowSelection}
          // `x: max-content` so narrow viewports scroll the columns instead of
          // clipping the rightmost one off the screen.
          scroll={{ x: "max-content", y: "100%" }}
          locale={{
            emptyText: (
              // An empty list is either "nothing recorded yet" or "the filter
              // excluded everything". Those need different next steps, so say
              // which one it is and offer the matching action.
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  hasActiveFilters
                    ? "この検索条件に一致する試合はありません"
                    : "まだ試合が登録されていません"
                }
              >
                {hasActiveFilters ? (
                  onClearFilters && (
                    <Button intent="neutral" onClick={onClearFilters}>
                      検索条件をクリア
                    </Button>
                  )
                ) : (
                  <Button intent="primary" icon={<PlusOutlined />} onClick={onCreateMatch}>
                    最初の試合を登録する
                  </Button>
                )}
              </Empty>
            ),
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total, [from, to]) => `${total} 件中 ${from}–${to} 件`,
            // No `onChange` here: paging and sorting are both resolved in
            // `handleTableChange`, so that a page change is not mistaken for a
            // sort change and does not reset back to page 1.
          }}
          onChange={handleTableChange}
        />
      </Spin>
    </Flex>
  );
}
