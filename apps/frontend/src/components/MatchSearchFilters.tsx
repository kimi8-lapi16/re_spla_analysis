import { Collapse, Col, DatePicker, Form, Radio, Row, Select } from "antd";
import { Dayjs } from "dayjs";
import { SearchMatchesRequest } from "../api";
import { useBattleTypes } from "../hooks/useBattleType";
import { useRules } from "../hooks/useRule";
import { useStages } from "../hooks/useStage";
import { useWeapons } from "../hooks/useWeapon";

const { RangePicker } = DatePicker;

type MatchSearchFiltersProps = {
  filters: {
    weapons?: number[];
    stages?: number[];
    rules?: number[];
    battleTypes?: number[];
    results?: Array<"WIN" | "LOSE">;
    dateRange?: [Dayjs, Dayjs];
    operator: SearchMatchesRequest.operator;
  };
  onFiltersChange: (filters: Partial<MatchSearchFiltersProps["filters"]>) => void;
};

const resultOptions = [
  { label: "勝ち", value: "WIN" as const },
  { label: "負け", value: "LOSE" as const },
];

export function MatchSearchFilters({ filters, onFiltersChange }: MatchSearchFiltersProps) {
  const { data: weapons, isLoading: isLoadingWeapons } = useWeapons();
  const { data: stages, isLoading: isLoadingStages } = useStages();
  const { data: rules, isLoading: isLoadingRules } = useRules();
  const { data: battleTypes, isLoading: isLoadingBattleTypes } = useBattleTypes();

  const weaponOptions =
    weapons?.map((weapon) => ({
      label: weapon.name,
      value: weapon.id,
    })) || [];

  const stageOptions =
    stages?.map((stage) => ({
      label: stage.name,
      value: stage.id,
    })) || [];

  const ruleOptions =
    rules?.map((rule) => ({
      label: rule.name,
      value: rule.id,
    })) || [];

  const battleTypeOptions =
    battleTypes?.map((battleType) => ({
      label: battleType.name,
      value: battleType.id,
    })) || [];
  return (
    <Collapse
      defaultActiveKey={["filters"]}
      items={[
        {
          key: "filters",
          label: "検索条件",
          children: (
            <Form size="small" layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="武器">
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
                  <Form.Item label="バトルタイプ">
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
                      value={filters.dateRange}
                      onChange={(dates) =>
                        onFiltersChange({ dateRange: dates as [Dayjs, Dayjs] | undefined })
                      }
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="検索条件">
                    <Radio.Group
                      value={filters.operator}
                      onChange={(e) => onFiltersChange({ operator: e.target.value })}
                    >
                      <Radio value={SearchMatchesRequest.operator.AND}>AND</Radio>
                      <Radio value={SearchMatchesRequest.operator.OR}>OR</Radio>
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
