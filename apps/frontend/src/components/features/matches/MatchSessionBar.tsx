import { Col, DatePicker, Form, Row, Select } from "antd";
import dayjs from "dayjs";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { BattleType, Rule, Stage } from "../../../api";
import { Card } from "../../base";
import { useRecentIds } from "../../../hooks/useRecentIds";
import { withRecentFirst } from "../../../utils/selectOptions";
import type { MatchSessionFormData } from "./sessionMatchColumns";

const RECENT_STAGES_KEY = "spla:recent-stage-ids";

/** A 2-hour rotation runs exactly two stages. */
export const MAX_ROTATION_STAGES = 2;

interface MatchSessionBarProps {
  control: Control<MatchSessionFormData>;
  errors: FieldErrors<MatchSessionFormData>;
  stages: Stage[] | undefined;
  rules: Rule[] | undefined;
  battleTypes: BattleType[] | undefined;
  /** Lets the page seed rows when the rotation turns out to have a single stage. */
  onStagesChange: (stageIds: number[]) => void;
}

/**
 * The conditions that hold for a whole play session.
 *
 * Date, battle type and rule barely change while you are playing, so asking for
 * them once here removes three fields from every match below.
 *
 * Stage is different: a rotation runs two of them and each match draws one, so
 * this collects the pair and every match picks which one it was.
 */
export function MatchSessionBar({
  control,
  errors,
  stages,
  rules,
  battleTypes,
  onStagesChange,
}: MatchSessionBarProps) {
  const { recentIds: recentStageIds } = useRecentIds(RECENT_STAGES_KEY);

  const stageOptions = withRecentFirst(
    stages?.map((stage) => ({ label: stage.name, value: stage.id })) ?? [],
    recentStageIds,
    { recent: "最近のステージ", all: "すべてのステージ" }
  );

  return (
    <Card size="small" title="このセッションの条件">
      {/*
        component={false} so this does not render a nested <form>: the page already
        wraps the whole session (bar + rows + submit) in one form element.
      */}
      <Form component={false} layout="vertical" size="middle">
        <div style={{ marginBottom: -16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label="日付"
                validateStatus={errors.session?.date ? "error" : ""}
                help={errors.session?.date?.message}
              >
                <Controller
                  name="session.date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      style={{ width: "100%" }}
                      allowClear={false}
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(date) => field.onChange(date ? date.format("YYYY-MM-DD") : "")}
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label="バトルタイプ"
                validateStatus={errors.session?.battleTypeId ? "error" : ""}
                help={errors.session?.battleTypeId?.message}
              >
                <Controller
                  name="session.battleTypeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      style={{ width: "100%" }}
                      placeholder="選択"
                      options={battleTypes?.map((bt) => ({ label: bt.name, value: bt.id }))}
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label="ルール"
                validateStatus={errors.session?.ruleId ? "error" : ""}
                help={errors.session?.ruleId?.message}
              >
                <Controller
                  name="session.ruleId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      style={{ width: "100%" }}
                      placeholder="選択"
                      options={rules?.map((rule) => ({ label: rule.name, value: rule.id }))}
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label="ステージ"
                extra="この時間帯の2つを選ぶと、試合ごとに切り替えられます"
                validateStatus={errors.session?.stageIds ? "error" : ""}
                help={
                  Array.isArray(errors.session?.stageIds)
                    ? undefined
                    : errors.session?.stageIds?.message
                }
              >
                <Controller
                  name="session.stageIds"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      mode="multiple"
                      style={{ width: "100%" }}
                      placeholder="2つまで選択"
                      showSearch
                      optionFilterProp="label"
                      options={stageOptions}
                      value={field.value ?? []}
                      onChange={(stageIds: number[]) => {
                        // A rotation runs two stages; keep the two most recently
                        // picked rather than silently ignoring the new one.
                        const capped = stageIds.slice(-MAX_ROTATION_STAGES);
                        field.onChange(capped);
                        onStagesChange(capped);
                      }}
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
    </Card>
  );
}
