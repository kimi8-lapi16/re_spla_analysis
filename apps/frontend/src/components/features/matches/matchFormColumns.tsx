import { DeleteOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { Button, DatePicker, InputNumber, Radio, Select } from "antd";
import dayjs from "dayjs";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { BattleType, Rule, Stage, WeaponResponse } from "../../../api";
import { formatDateTimeAsJstIso } from "../../../utils/date";

export type MatchFormField = {
  id: string;
  weaponId?: number;
  stageId?: number;
  ruleId?: number;
  battleTypeId?: number;
  result?: "WIN" | "LOSE";
  gameDateTime?: string;
  point?: number | null;
};

export type MatchFormData = {
  matches: MatchFormField[];
};

type MatchFormErrors = FieldErrors<MatchFormData>;

type CreateMatchFormColumnsParams = {
  control: Control<MatchFormData>;
  errors: MatchFormErrors;
  fieldsLength: number;
  remove: (index: number) => void;
  weapons: WeaponResponse[] | undefined;
  stages: Stage[] | undefined;
  rules: Rule[] | undefined;
  battleTypes: BattleType[] | undefined;
};

export function createMatchFormColumns({
  control,
  errors,
  fieldsLength,
  remove,
  weapons,
  stages,
  rules,
  battleTypes,
}: CreateMatchFormColumnsParams): TableColumnsType<MatchFormField> {
  return [
    {
      title: "ブキ",
      dataIndex: "weaponId",
      key: "weaponId",
      width: 200,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.weaponId`}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              style={{ width: "100%" }}
              placeholder="選択してください"
              status={
                Array.isArray(errors.matches) && errors.matches[index]?.weaponId ? "error" : ""
              }
              showSearch
              optionFilterProp="label"
              options={weapons?.map((w) => ({
                value: w.id,
                label: w.name,
              }))}
            />
          )}
        />
      ),
    },
    {
      title: "ステージ",
      dataIndex: "stageId",
      key: "stageId",
      width: 200,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.stageId`}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              style={{ width: "100%" }}
              placeholder="選択してください"
              status={
                Array.isArray(errors.matches) && errors.matches[index]?.stageId ? "error" : ""
              }
              showSearch
              optionFilterProp="label"
              options={stages?.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />
          )}
        />
      ),
    },
    {
      title: "ルール",
      dataIndex: "ruleId",
      key: "ruleId",
      width: 150,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.ruleId`}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              style={{ width: "100%" }}
              placeholder="選択してください"
              status={Array.isArray(errors.matches) && errors.matches[index]?.ruleId ? "error" : ""}
              options={rules?.map((r) => ({
                value: r.id,
                label: r.name,
              }))}
            />
          )}
        />
      ),
    },
    {
      title: "バトル",
      dataIndex: "battleTypeId",
      key: "battleTypeId",
      width: 150,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.battleTypeId`}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              style={{ width: "100%" }}
              placeholder="選択してください"
              status={
                Array.isArray(errors.matches) && errors.matches[index]?.battleTypeId ? "error" : ""
              }
              options={battleTypes?.map((bt) => ({
                value: bt.id,
                label: bt.name,
              }))}
            />
          )}
        />
      ),
    },
    {
      title: "勝敗",
      dataIndex: "result",
      key: "result",
      width: 120,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.result`}
          control={control}
          render={({ field }) => (
            <Radio.Group {...field}>
              <Radio value="WIN">勝ち</Radio>
              <Radio value="LOSE">負け</Radio>
            </Radio.Group>
          )}
        />
      ),
    },
    {
      title: "日時",
      dataIndex: "gameDateTime",
      key: "gameDateTime",
      width: 200,
      render: (_: unknown, __: unknown, index: number) => (
        <Controller
          name={`matches.${index}.gameDateTime`}
          control={control}
          render={({ field }) => (
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
              placeholder="日時を選択"
              status={
                Array.isArray(errors.matches) && errors.matches[index]?.gameDateTime ? "error" : ""
              }
              value={field.value ? dayjs(field.value) : null}
              onChange={(date) => field.onChange(formatDateTimeAsJstIso(date))}
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
      title: "操作",
      key: "action",
      width: 80,
      fixed: "right" as const,
      render: (_: unknown, __: unknown, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => remove(index)}
          disabled={fieldsLength === 1}
        />
      ),
    },
  ];
}
