import { Card, Flex, Select, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import { usePointTransition } from "../../../hooks/useAnalysis";
import { useRules } from "../../../hooks/useRule";
import { PointTransitionChart } from "./PointTransitionChart";

const { Text } = Typography;

const SELECT_WIDTH = 200;

export function PointTransitionTab() {
  const { data: rules, isLoading: isLoadingRules } = useRules();
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);

  const { data, isLoading } = usePointTransition({
    ruleId: selectedRuleId ?? 0,
    enabled: selectedRuleId !== null && selectedRuleId > 0,
  });

  const ruleOptions = useMemo(() => {
    if (!rules) return [];
    return rules.map((rule) => ({
      label: rule.name,
      value: rule.id,
    }));
  }, [rules]);

  const selectedRuleName = useMemo(() => {
    if (!rules || !selectedRuleId) return undefined;
    return rules.find((r) => r.id === selectedRuleId)?.name;
  }, [rules, selectedRuleId]);

  return (
    <Flex vertical gap="middle" style={{ width: "100%" }}>
      <Card size="small">
        <Space>
          <Text strong>ルール選択:</Text>
          <Select
            popupMatchSelectWidth={SELECT_WIDTH}
            placeholder="ルールを選択"
            options={ruleOptions}
            loading={isLoadingRules}
            value={selectedRuleId}
            onChange={setSelectedRuleId}
          />
        </Space>
      </Card>

      <Card>
        {selectedRuleId === null ? (
          <Text type="secondary">ルールを選択してください</Text>
        ) : (
          <PointTransitionChart
            data={data?.points}
            isLoading={isLoading}
            ruleName={selectedRuleName}
          />
        )}
      </Card>
    </Flex>
  );
}
