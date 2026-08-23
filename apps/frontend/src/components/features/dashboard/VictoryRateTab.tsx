import { Checkbox, Typography, Space, Flex } from "antd";
import { Card } from "../../base";
import { useState } from "react";
import {
  useVictoryRate,
  type GroupByField,
  type VictoryRateSortBy,
} from "../../../hooks/useAnalysis";
import { useTableState } from "../../../hooks/useTableState";
import { VictoryRateTable } from "./VictoryRateTable";

const { Text } = Typography;

const GROUP_BY_OPTIONS: { label: string; value: GroupByField }[] = [
  { label: "ルール", value: "rule" },
  { label: "ステージ", value: "stage" },
  { label: "ブキ", value: "weapon" },
  { label: "バトルタイプ", value: "battleType" },
];

const DEFAULT_SORT_BY: VictoryRateSortBy = "victoryRate";

// 名前カラムのソートは、対応するグルーピングが有効なときのみバックエンドで扱える
const SORT_BY_REQUIRED_GROUP_BY: Partial<Record<VictoryRateSortBy, GroupByField>> = {
  ruleName: "rule",
  stageName: "stage",
  weaponName: "weapon",
  battleTypeName: "battleType",
};

function isGroupByField(value: string): value is GroupByField {
  return ["rule", "stage", "weapon", "battleType"].includes(value);
}

export function VictoryRateTab() {
  const [selectedGroupBy, setSelectedGroupBy] = useState<GroupByField[]>(["rule"]);
  const { tableState, setTableState } = useTableState<VictoryRateSortBy>({
    defaultSortBy: DEFAULT_SORT_BY,
  });

  const { data, isLoading } = useVictoryRate({
    groupBy: selectedGroupBy,
    sortBy: tableState.sortBy,
    sortOrder: tableState.sortOrder,
    page: tableState.page,
    pageSize: tableState.pageSize,
    enabled: selectedGroupBy.length > 0,
  });

  const handleGroupByChange = (checkedValues: string[]) => {
    const validValues = checkedValues.filter(isGroupByField);
    setSelectedGroupBy(validValues);

    // グルーピングから外れた列でソートしたままだとリクエストが不正になるため、既定のソートに戻す
    const requiredGroupBy = SORT_BY_REQUIRED_GROUP_BY[tableState.sortBy];
    const isSortByAvailable = !requiredGroupBy || validValues.includes(requiredGroupBy);

    setTableState({
      ...tableState,
      page: 1,
      sortBy: isSortByAvailable ? tableState.sortBy : DEFAULT_SORT_BY,
    });
  };

  return (
    <Flex vertical gap="middle" style={{ height: "100%", minHeight: 0 }}>
      <Card size="small">
        <Space>
          <Text strong>グルーピング:</Text>
          <Checkbox.Group
            options={GROUP_BY_OPTIONS}
            value={selectedGroupBy}
            onChange={handleGroupByChange}
          />
        </Space>
      </Card>

      {selectedGroupBy.length === 0 ? (
        <Card>
          <Text type="secondary">グルーピング対象を1つ以上選択してください</Text>
        </Card>
      ) : (
        <Flex vertical style={{ flex: 1, minHeight: 0 }}>
          <VictoryRateTable
            data={data?.victoryRates}
            total={data?.total ?? 0}
            isLoading={isLoading}
            groupBy={selectedGroupBy}
            tableState={tableState}
            onChange={setTableState}
          />
        </Flex>
      )}
    </Flex>
  );
}
