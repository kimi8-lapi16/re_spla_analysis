import { Empty, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMemo } from "react";
import type { MatchResponse } from "../../../api";
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
  selectedRowKeys?: string[];
  onSelectionChange?: (selectedKeys: string[], selectedRows: MatchResponse[]) => void;
};

type TableRow = MatchResponse & { key: string };

export function MatchTable({
  matches,
  isLoading,
  pagination,
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

  const columns: ColumnsType<TableRow> = [
    {
      title: "日時",
      dataIndex: "gameDateTime",
      key: "gameDateTime",
      width: 150,
      render: (value: string) => dayjs(value).format("YYYY/MM/DD HH:mm"),
    },
    {
      title: "ルール",
      dataIndex: "ruleId",
      key: "rule",
      width: 120,
      render: (ruleId: number) => ruleMap.get(ruleId) || "-",
    },
    {
      title: "ステージ",
      dataIndex: "stageId",
      key: "stage",
      width: 150,
      render: (stageId: number) => stageMap.get(stageId) || "-",
    },
    {
      title: "ブキ",
      dataIndex: "weaponId",
      key: "weapon",
      width: 150,
      render: (weaponId: number) => weaponMap.get(weaponId) || "-",
    },
    {
      title: "バトルタイプ",
      dataIndex: "battleTypeId",
      key: "battleType",
      width: 120,
      render: (battleTypeId: number) => battleTypeMap.get(battleTypeId) || "-",
    },
    {
      title: "勝敗",
      dataIndex: "result",
      key: "result",
      width: 80,
      render: (result: string) => (result === "WIN" ? "勝ち" : "負け"),
    },
    {
      title: "ポイント",
      dataIndex: "point",
      key: "point",
      width: 100,
      render: (point: number | null) => point ?? "-",
    },
  ];

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
        scroll={{ y: "calc(100vh - 480px)" }}
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
      />
    </Spin>
  );
}
