import { DeleteOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { InputNumber, Radio, Select, TimePicker, Typography } from "antd";
import dayjs from "dayjs";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { Stage, WeaponResponse } from "../../../api";
import { Button } from "../../base";
import { withRecentFirst } from "../../../utils/selectOptions";

const { Text } = Typography;

export const TIME_FORMAT = "HH:mm";

/** One match within a session. Date, battle type and rule live on the session. */
export type SessionMatchField = {
  id: string;
  weaponId?: number;
  stageId?: number;
  result?: "WIN" | "LOSE";
  time?: string;
  point?: number | null;
};

export type MatchSessionFormData = {
  session: {
    date: string;
    battleTypeId?: number;
    ruleId?: number;
    /**
     * The stages in this rotation. A 2-hour rotation runs two stages and each
     * match draws one of them, so this holds up to two - never one "session
     * stage" that every match inherits.
     */
    stageIds: number[];
  };
  matches: SessionMatchField[];
};

type SessionMatchColumnsParams = {
  control: Control<MatchSessionFormData>;
  errors: FieldErrors<MatchSessionFormData>;
  fieldsLength: number;
  remove: (index: number) => void;
  weapons: WeaponResponse[] | undefined;
  stages: Stage[] | undefined;
  recentWeaponIds: number[];
  recentStageIds: number[];
  /** The rotation's stages, used to offer a 2-way choice per match. */
  sessionStageIds: number[];
};

function rowError(errors: FieldErrors<MatchSessionFormData>, index: number) {
  return Array.isArray(errors.matches) ? errors.matches[index] : undefined;
}

export function createSessionMatchColumns({
  control,
  errors,
  fieldsLength,
  remove,
  weapons,
  stages,
  recentWeaponIds,
  recentStageIds,
  sessionStageIds,
}: SessionMatchColumnsParams): TableColumnsType<SessionMatchField> {
  const stageById = new Map((stages ?? []).map((stage) => [stage.id, stage.name]));
  const rotationStages = sessionStageIds
    .map((id) => ({ id, name: stageById.get(id) }))
    .filter((stage): stage is { id: number; name: string } => stage.name !== undefined);
  // Two stages in the rotation: offer exactly those, as one tap and with no
  // preselection. Guessing here would be wrong about half the time.
  const hasRotationChoice = rotationStages.length >= 2;
  const weaponOptions = withRecentFirst(
    weapons?.map((weapon) => ({ label: weapon.name, value: weapon.id })) ?? [],
    recentWeaponIds,
    { recent: "最近使ったブキ", all: "すべてのブキ" }
  );

  const stageOptions = withRecentFirst(
    stages?.map((stage) => ({ label: stage.name, value: stage.id })) ?? [],
    recentStageIds,
    { recent: "最近のステージ", all: "すべてのステージ" }
  );

  return [
    {
      title: "#",
      key: "index",
      width: 48,
      render: (_: unknown, __: unknown, index: number) => (
        <Text type="secondary" style={{ fontVariantNumeric: "tabular-nums" }}>
          {index + 1}
        </Text>
      ),
    },
    {
      title: "ブキ",
      dataIndex: "weaponId",
      key: "weaponId",
      width: 220,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.weaponId`}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              style={{ width: "100%" }}
              placeholder="選択してください"
              status={rowError(errors, index)?.weaponId ? "error" : ""}
              showSearch
              optionFilterProp="label"
              options={weaponOptions}
            />
          )}
        />
      ),
    },
    {
      title: "ステージ",
      dataIndex: "stageId",
      key: "stageId",
      width: hasRotationChoice ? 260 : 200,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.stageId`}
          control={control}
          render={({ field }) =>
            hasRotationChoice ? (
              <Radio.Group
                {...field}
                optionType="button"
                options={rotationStages.map((stage) => ({ label: stage.name, value: stage.id }))}
              />
            ) : (
              <Select
                {...field}
                style={{ width: "100%" }}
                placeholder="選択してください"
                status={rowError(errors, index)?.stageId ? "error" : ""}
                showSearch
                optionFilterProp="label"
                options={stageOptions}
              />
            )
          }
        />
      ),
    },
    {
      title: "勝敗",
      dataIndex: "result",
      key: "result",
      width: 150,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.result`}
          control={control}
          render={({ field }) => (
            <Radio.Group
              {...field}
              optionType="button"
              options={[
                { label: "勝ち", value: "WIN" },
                { label: "負け", value: "LOSE" },
              ]}
            />
          )}
        />
      ),
    },
    {
      title: "ポイント",
      dataIndex: "point",
      key: "point",
      width: 120,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.point`}
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              value={field.value ?? undefined}
              style={{ width: "100%" }}
              placeholder="任意"
              min={0}
            />
          )}
        />
      ),
    },
    {
      title: "時刻",
      dataIndex: "time",
      key: "time",
      width: 120,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.time`}
          control={control}
          render={({ field }) => (
            <TimePicker
              format={TIME_FORMAT}
              style={{ width: "100%" }}
              allowClear={false}
              value={field.value ? dayjs(field.value, TIME_FORMAT) : null}
              onChange={(time) => field.onChange(time ? time.format(TIME_FORMAT) : "")}
            />
          )}
        />
      ),
    },
    {
      title: "",
      key: "action",
      width: 56,
      render: (_: unknown, __: unknown, index: number) => (
        <Button
          intent="dangerQuiet"
          icon={<DeleteOutlined />}
          aria-label={`${index + 1} 行目を削除`}
          onClick={() => remove(index)}
          disabled={fieldsLength === 1}
        />
      ),
    },
  ];
}
