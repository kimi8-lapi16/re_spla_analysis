import { Card, Checkbox, Typography, Space, Flex } from "antd";
import { useState } from "react";
import { useVictoryRate, type GroupByField } from "../../../hooks/useAnalysis";
import { VictoryRateTable } from "./VictoryRateTable";

const { Text } = Typography;

const GROUP_BY_OPTIONS: { label: string; value: GroupByField }[] = [
  { label: "ルール", value: "rule" },
  { label: "ステージ", value: "stage" },
  { label: "ブキ", value: "weapon" },
  { label: "バトルタイプ", value: "battleType" },
];

function isGroupByField(value: string): value is GroupByField {
  return ["rule", "stage", "weapon", "battleType"].includes(value);
}

export function VictoryRateTab() {
  const [selectedGroupBy, setSelectedGroupBy] = useState<GroupByField[]>([
    "rule",
  ]);

  const { data, isLoading } = useVictoryRate({
    groupBy: selectedGroupBy,
    enabled: selectedGroupBy.length > 0,
  });

  const handleGroupByChange = (checkedValues: string[]) => {
    const validValues = checkedValues.filter(isGroupByField);
    setSelectedGroupBy(validValues);
  };

  return (
    <Flex vertical gap="middle">
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
          <Text type="secondary">
            グルーピング対象を1つ以上選択してください
          </Text>
        </Card>
      ) : (
        <VictoryRateTable
          data={data?.victoryRates}
          isLoading={isLoading}
          groupBy={selectedGroupBy}
        />
      )}
    </Flex>
  );
}
