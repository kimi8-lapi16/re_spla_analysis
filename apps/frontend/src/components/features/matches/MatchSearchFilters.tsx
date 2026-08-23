import { Col, Collapse, DatePicker, Flex, Form, Radio, Row, Select, Tag, Typography } from "antd";
import { Dayjs } from "dayjs";
import { useState } from "react";
import { SearchMatchesRequest } from "../../../api/models/SearchMatchesRequest";
import { Button } from "../../base";
import { useBattleTypes } from "../../../hooks/useBattleType";
import { useRules } from "../../../hooks/useRule";
import { useStages } from "../../../hooks/useStage";
import { useWeapons } from "../../../hooks/useWeapon";

const { RangePicker } = DatePicker;
const { Text } = Typography;

type Filters = {
  weapons?: number[];
  stages?: number[];
  rules?: number[];
  battleTypes?: number[];
  results?: Array<"WIN" | "LOSE">;
  dateRange?: [Dayjs, Dayjs];
  operator: SearchMatchesRequest.operator;
};

type MatchSearchFiltersProps = {
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
};

const resultOptions = [
  { label: "勝ち", value: "WIN" as const },
  { label: "負け", value: "LOSE" as const },
];

/** Every filter key that can be cleared, so "clear all" cannot drift out of sync. */
const CLEARABLE_KEYS = [
  "weapons",
  "stages",
  "rules",
  "battleTypes",
  "results",
  "dateRange",
] as const;

const EMPTY_FILTERS: Partial<Filters> = Object.fromEntries(
  CLEARABLE_KEYS.map((key) => [key, undefined])
);

type Option = { label: string; value: number };

/**
 * One chip per filter group rather than one per selected value: the header stays
 * a single line no matter how much is selected, and removing a chip clears a
 * whole group, which is predictable.
 */
function describeSelection(values: number[] | undefined, options: Option[]): string | null {
  if (!values || values.length === 0) return null;
  if (values.length === 1) {
    return options.find((option) => option.value === values[0])?.label ?? "1件";
  }
  return `${values.length}件`;
}

export function MatchSearchFilters({ filters, onFiltersChange }: MatchSearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: weapons, isLoading: isLoadingWeapons } = useWeapons();
  const { data: stages, isLoading: isLoadingStages } = useStages();
  const { data: rules, isLoading: isLoadingRules } = useRules();
  const { data: battleTypes, isLoading: isLoadingBattleTypes } = useBattleTypes();

  const weaponOptions: Option[] =
    weapons?.map((weapon) => ({ label: weapon.name, value: weapon.id })) || [];
  const stageOptions: Option[] =
    stages?.map((stage) => ({ label: stage.name, value: stage.id })) || [];
  const ruleOptions: Option[] = rules?.map((rule) => ({ label: rule.name, value: rule.id })) || [];
  const battleTypeOptions: Option[] =
    battleTypes?.map((battleType) => ({ label: battleType.name, value: battleType.id })) || [];

  const appliedChips: { key: keyof Filters; label: string }[] = [];

  const weaponSummary = describeSelection(filters.weapons, weaponOptions);
  if (weaponSummary) appliedChips.push({ key: "weapons", label: `ブキ: ${weaponSummary}` });

  const stageSummary = describeSelection(filters.stages, stageOptions);
  if (stageSummary) appliedChips.push({ key: "stages", label: `ステージ: ${stageSummary}` });

  const ruleSummary = describeSelection(filters.rules, ruleOptions);
  if (ruleSummary) appliedChips.push({ key: "rules", label: `ルール: ${ruleSummary}` });

  const battleTypeSummary = describeSelection(filters.battleTypes, battleTypeOptions);
  if (battleTypeSummary) {
    appliedChips.push({ key: "battleTypes", label: `バトル: ${battleTypeSummary}` });
  }

  if (filters.results && filters.results.length > 0) {
    const label =
      filters.results.length === 1
        ? (resultOptions.find((option) => option.value === filters.results?.[0])?.label ?? "")
        : `${filters.results.length}件`;
    appliedChips.push({ key: "results", label: `勝敗: ${label}` });
  }

  if (filters.dateRange) {
    const [from, to] = filters.dateRange;
    appliedChips.push({
      key: "dateRange",
      label: `期間: ${from.format("YYYY/MM/DD")} – ${to.format("YYYY/MM/DD")}`,
    });
  }

  const hasAppliedFilters = appliedChips.length > 0;

  // Chips and the clear button live inside the Collapse header, which toggles on
  // click - so their own clicks must not bubble up to it.
  const stopToggle = (event: React.MouseEvent) => event.stopPropagation();

  const header = (
    <Flex align="center" gap="small" wrap>
      <Text strong>検索条件</Text>
      {hasAppliedFilters ? (
        <Flex align="center" gap={4} wrap onClick={stopToggle}>
          {appliedChips.map((chip) => (
            <Tag
              key={chip.key}
              closable
              onClose={() => onFiltersChange({ [chip.key]: undefined })}
            >
              {chip.label}
            </Tag>
          ))}
        </Flex>
      ) : (
        <Text type="secondary">すべての試合を表示中</Text>
      )}
    </Flex>
  );

  return (
    <Collapse
      activeKey={isOpen ? ["filters"] : []}
      onChange={(keys) => setIsOpen(keys.length > 0)}
      items={[
        {
          key: "filters",
          label: header,
          extra: hasAppliedFilters ? (
            <span onClick={stopToggle}>
              <Button intent="quiet" size="small" onClick={() => onFiltersChange(EMPTY_FILTERS)}>
                すべてクリア
              </Button>
            </span>
          ) : undefined,
          children: (
            <Form size="small" layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="ブキ">
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="選択"
                      options={weaponOptions}
                      loading={isLoadingWeapons}
                      value={filters.weapons}
                      onChange={(value) => onFiltersChange({ weapons: value })}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="ステージ">
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="選択"
                      options={stageOptions}
                      loading={isLoadingStages}
                      value={filters.stages}
                      onChange={(value) => onFiltersChange({ stages: value })}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="ルール">
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="選択"
                      options={ruleOptions}
                      loading={isLoadingRules}
                      value={filters.rules}
                      onChange={(value) => onFiltersChange({ rules: value })}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="バトル">
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="選択"
                      options={battleTypeOptions}
                      loading={isLoadingBattleTypes}
                      value={filters.battleTypes}
                      onChange={(value) => onFiltersChange({ battleTypes: value })}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="勝敗">
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="選択"
                      options={resultOptions}
                      value={filters.results}
                      onChange={(value) => onFiltersChange({ results: value })}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item label="日付範囲">
                    <RangePicker
                      showTime
                      style={{ width: "100%" }}
                      placeholder={["開始日時", "終了日時"]}
                      value={filters.dateRange}
                      onChange={(dates) =>
                        onFiltersChange({ dateRange: dates as [Dayjs, Dayjs] | undefined })
                      }
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="複数条件の結合方法">
                    <Radio.Group
                      value={filters.operator}
                      onChange={(e) => onFiltersChange({ operator: e.target.value })}
                    >
                      <Radio value={SearchMatchesRequest.operator.AND}>
                        AND（すべて満たす）
                      </Radio>
                      <Radio value={SearchMatchesRequest.operator.OR}>
                        OR（いずれかを満たす）
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          ),
        },
      ]}
    />
  );
}
