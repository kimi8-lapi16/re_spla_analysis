import { Card, DatePicker, Flex, Select, Space, Typography } from "antd";
import { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { usePointTransition } from "../../../hooks/useAnalysis";
import { useBattleTypes } from "../../../hooks/useBattleType";
import { useRules } from "../../../hooks/useRule";
import { formatDateTimeAsJstIso } from "../../../utils/date";
import { PointTransitionChart } from "./PointTransitionChart";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const SELECT_WIDTH = 200;

export function PointTransitionTab() {
  const { data: rules, isLoading: isLoadingRules } = useRules();
  const { data: battleTypes, isLoading: isLoadingBattleTypes } = useBattleTypes();
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [selectedBattleTypeId, setSelectedBattleTypeId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const isSelectionComplete = selectedRuleId !== null && selectedRuleId > 0 && selectedBattleTypeId !== null && selectedBattleTypeId > 0;

  const startDate = dateRange?.[0] ? formatDateTimeAsJstIso(dateRange[0].startOf("day")) : undefined;
  const endDate = dateRange?.[1] ? formatDateTimeAsJstIso(dateRange[1].endOf("day")) : undefined;

  const { data, isLoading } = usePointTransition({
    ruleId: selectedRuleId ?? 0,
    battleTypeId: selectedBattleTypeId ?? 0,
    startDate,
    endDate,
    enabled: isSelectionComplete,
  });

  const ruleOptions = useMemo(() => {
    if (!rules) return [];
    return rules.map((rule) => ({
      label: rule.name,
      value: rule.id,
    }));
  }, [rules]);

  const battleTypeOptions = useMemo(() => {
    if (!battleTypes) return [];
    return battleTypes.map((battleType) => ({
      label: battleType.name,
      value: battleType.id,
    }));
  }, [battleTypes]);

  const selectedRuleName = useMemo(() => {
    if (!rules || !selectedRuleId) return undefined;
    return rules.find((r) => r.id === selectedRuleId)?.name;
  }, [rules, selectedRuleId]);

  const selectedBattleTypeName = useMemo(() => {
    if (!battleTypes || !selectedBattleTypeId) return undefined;
    return battleTypes.find((b) => b.id === selectedBattleTypeId)?.name;
  }, [battleTypes, selectedBattleTypeId]);

  const chartTitle = useMemo(() => {
    if (!selectedRuleName || !selectedBattleTypeName) return undefined;
    return `${selectedBattleTypeName} - ${selectedRuleName}`;
  }, [selectedRuleName, selectedBattleTypeName]);

  return (
    <Flex vertical gap="middle" style={{ width: "100%" }}>
      <Card size="small">
        <Space wrap>
          <Space>
            <Text strong>バトルタイプ:</Text>
            <Select
              popupMatchSelectWidth={SELECT_WIDTH}
              placeholder="バトルタイプを選択"
              options={battleTypeOptions}
              loading={isLoadingBattleTypes}
              value={selectedBattleTypeId}
              onChange={setSelectedBattleTypeId}
            />
          </Space>
          <Space>
            <Text strong>ルール:</Text>
            <Select
              popupMatchSelectWidth={SELECT_WIDTH}
              placeholder="ルールを選択"
              options={ruleOptions}
              loading={isLoadingRules}
              value={selectedRuleId}
              onChange={setSelectedRuleId}
            />
          </Space>
          <Space>
            <Text strong>期間:</Text>
            <RangePicker
              placeholder={["開始日", "終了日"]}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
            />
          </Space>
        </Space>
      </Card>

      <Card>
        {!isSelectionComplete ? (
          <Text type="secondary">バトルタイプとルールを選択してください</Text>
        ) : (
          <PointTransitionChart
            data={data?.points}
            isLoading={isLoading}
            ruleName={chartTitle}
          />
        )}
      </Card>
    </Flex>
  );
}
